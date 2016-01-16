/**
 * Securely encrypt and decrypt sensitive files for use in public source
 * control.
 *
 * @module lib/nodeCipher
 * @exports {NodeCipher}
 * @author Nathan Buchar
 * @since 3.0.0
 */

'use strict';

let _ = require('lodash');
let crypto = require('crypto');
let debug = require('debug');
let fse = require('fs-extra');
let validate = require('validate');

/**
 * Configure debuggers.
 */
let debugEncrypt = require('debug')('nodecipher:encrypt');
let debugDecrypt = require('debug')('nodecipher:decrypt');

/**
 * Get all valid ciphers.
 */
let ciphers = crypto.getCiphers();

/**
 * @class NodeCipher
 */
class NodeCipher {

  /**
   * NodeCipher instance constructor.
   *
   * @constructor
   */
  constructor() {}

  /**
   * Encrypt a file using the options provided.
   *
   * @see _encryptOrDecrypt
   * @param {Object} options
   * @param {Function} [callback]
   * @param {Object} [scope]
   * @private
   */
  _encrypt(options, callback, scope) {
    debugEncrypt('encrypt with options ' + JSON.stringify(options));

    this._encryptOrDecrypt(options, crypto.createCipher, err => {
      if (_.isFunction(callback)) {
        callback.call(scope, err);
      }
    });
  }

  /**
   * Decrypt a file using the options provided.
   *
   * @see _encryptOrDecrypt
   * @param {Object} options
   * @param {Function} [callback]
   * @param {Object} [scope]
   * @private
   */
  _decrypt(options, callback, scope) {
    debugDecrypt('decrypt with options ' + JSON.stringify(options));

    this._encryptOrDecrypt(options, crypto.createDecipher, err => {
      if (_.isFunction(callback)) {
        callback.call(scope, err);
      }
    });
  }

  /**
   * Parses the encryption or decryption request to verify that all the options
   * are valid and there are no errors.
   *
   * @see _cipher
   * @param {Object} options
   * @param {Crypto.<Cipher|Decipher>} method
   * @param {Function} [done]
   * @private
   */
  _encryptOrDecrypt(options, method, done) {
    let opts = this._parseOptions(options);
    let errors = this._validateOptions(opts);

    if (errors.length) {
      let err = new Error(errors[0].message);

      done(err);
    } else {
      this._cipher(options, method, done);
    }
  }

  /**
   * Cipher the file using the options provided with the given cipher method.
   *
   * @param {Object} options
   * @param {Crypto.<Cipher|Decipher>} method
   * @param {Function} done
   * @private
   */
  _cipher(options, method, done) {
    let readStream = fse.createReadStream(options.input);
    let writeStream = fse.createOutputStream(options.output);
    let handleError = this._handleStreamError(readStream, done);
    let cipher = method(options.algorithm, options.password);

    // Wait for the writable steam to end, then call our "done" function.
    writeStream.on('finish', () => {
      done(null);
    });

    // Pipe the readable input stream through our cipher method, created from
    // our chosen algorithm and password, and write the ciphered result into
    // our writable output stream.
    readStream
      .on('error', handleError)
      .pipe(cipher)
      .on('error', handleError)
      .pipe(writeStream)
      .on('error', handleError);
  }

  /**
   * The synchronous version of _encrypt().
   *
   * @see _encryptOrDecryptSync
   * @param {Object} options
   * @private
   */
  _encryptSync(options) {
    debugEncrypt('synch encrypt with options ' + JSON.stringify(options));

    this._encryptOrDecryptSync(options, crypto.createCipher);
  }

  /**
   * The synchronous version of _decrypt().
   *
   * @see _encryptOrDecryptSync
   * @param {Object} options
   * @private
   */
  _decryptSync(options) {
    debugDecrypt('synch decrypt with options ' + JSON.stringify(options));

    this._encryptOrDecryptSync(options, crypto.createDecipher);
  }

  /**
   * The synchronous version of _encryptOrDecrypt().
   *
   * @see _cipherSync
   * @param {Object} options
   * @param {Crypto.<Cipher|Decipher>} method
   * @private
   */
  _encryptOrDecryptSync(options, method) {
    let opts = this._parseOptions(options);
    let errors = this._validateOptions(opts);

    if (errors.length) {
      throw new Error(errors[0].message);
    } else {
      this._cipherSync(opts, method);
    }
  }

  /**
   * The synchronous version of _cipher().
   *
   * @param {Object} options
   * @param {Crypto.<Cipher|Decipher>} method
   * @private
   */
  _cipherSync(options, method) {
    try {
      let inputBuffer = fse.readFileSync(options.input);
      let cipher = method(options.algorithm, options.password);

      // Write the ciphered buffer to our output file.
      fse.writeFileSync(options.output, Buffer.concat([
        cipher.update(inputBuffer),
        cipher.final()
      ]));
    } catch (err) {
      throw err;
    }
  }

  /**
   * Parse the options provided and fill in any missing options with default
   * values.
   *
   * @param {Object} options
   * @returns {Object} opts
   * @private
   */
  _parseOptions(options) {
    return _.defaults(options, NodeCipher.Defaults);
  }

  /**
   * Validates that all NodeCipher options follow the proper schema.
   *
   * @param {Object} options
   * @returns {Array} errors
   * @private
   */
  _validateOptions(options) {
    let errors = NodeCipher.OptionsSchema.validate(options);

    // Verify that the chosen algorithm is valid.
    if (!_.includes(ciphers, options.algorithm)) {
      errors.push({
        path: 'algorithm',
        message: `"${options.algorithm}" is not a valid cipher algorithm.`
      });
    }

    return errors;
  }

  /**
   * Handles read stream errors. The returned closure unpipes the stream then
   * calls the callback with the error.
   *
   * @param {Stream} stream
   * @param {Function} callback
   * @returns {Function}
   * @private
   */
  _handleStreamError(stream, callback) {
    return function (err) {
      stream.unpipe();
      callback(err);
    };
  }

  /**
   * Public method for encrypting a file using the options provided.
   *
   * @see _encrypt
   * @param {Object} options
   * @param {Function} [callback]
   * @param {Object} [scope]
   * @access public
   */
  encrypt(options, callback, scope) {
    this._encrypt.apply(this, arguments);
  }

  /**
   * Public method for decrypting a file using the options provided.
   *
   * @see _decrypt
   * @param {Object} options
   * @param {Function} [callback]
   * @param {Object} [scope]
   * @access public
   */
  decrypt(options, callback, scope) {
    this._decrypt.apply(this, arguments);
  }

  /**
   * The synchronous version of encrypt().
   *
   * @see _encryptSync
   * @param {Object} options
   * @access public
   */
  encryptSync(options) {
    this._encryptSync.apply(this, arguments);
  }

  /**
   * The synchronous version of decrypt().
   *
   * @see _decryptSync
   * @param {Object} options
   * @access public
   */
  decryptSync(options) {
    this._decryptSync.apply(this, arguments);
  }

  /**
   * Lists all valid cipher algorithms.
   *
   * @returns {Array}
   * @access public
   */
  list() {
    return ciphers;
  }

  /**
   * Gets NodeCipher defaults.
   *
   * @returns {Object}
   * @access public
   */
  get defaults() {
    return NodeCipher.Defaults;
  }
}

/**
 * @enum {string} defaults
 */
NodeCipher.Defaults = {
  input: undefined,
  output: undefined,
  password: undefined,
  algorithm: 'cast5-cbc'
};

/**
 * @enum {Object} OptionsSchema
 */
NodeCipher.OptionsSchema = validate({
  input: {
    type: 'string',
    required: true,
    message: '"input" is required and must be a string.'
  },
  output: {
    type: 'string',
    required: true,
    message: '"output" is required and must be a string.'
  },
  password: {
    type: 'string',
    required: true,
    message: '"password" is required and must be a string.'
  },
  algorithm: {
    type: 'string',
    required: true,
    message: '"algorithm" is required and must be a string.'
  }
});

module.exports = new NodeCipher();
