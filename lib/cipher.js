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
let fs = require('fs-extra');

let constants = require('./constants');
let defaults = require('./defaults');
let validators = require('./validators');

/**
 * @class NodeCipher
 * @classdesc A collection of public and private methods used to asynchronously
 *   or synchronously encrypt or decrypt a chosen input file using the options
 *   provided into the chosen output file.
 * @author Nathan Buchar
 */
class NodeCipher {

  /**
   * Core asynchronous methods.
   *
   * - _encrypt()
   * - _decrypt()
   * - _parseCipherRequest()
   * - _handleErrors():Promise
   * - _cipher()
   * - _deriveKeyFromOptions()
   */

  /**
   * Encrypt a file using the options provided.
   *
   * @see _parseCipherRequest
   * @param {Object} options
   * @param {Function} [callback]
   * @param {Object} [scope]
   * @private
   */
  _encrypt(options, callback, scope) {
    this._parseCipherRequest(NodeCipher.Actions.ENCRYPT, options, err => {
      if (_.isFunction(callback)) {
        callback.call(scope, err);
      }
    });
  }

  /**
   * Decrypt a file using the options provided.
   *
   * @see _parseCipherRequest
   * @param {Object} options
   * @param {Function} [callback]
   * @param {Object} [scope]
   * @private
   */
  _decrypt(options, callback, scope) {
    this._parseCipherRequest(NodeCipher.Actions.DECRYPT, options, err => {
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
   * @param {Object} action
   * @param {Object} options
   * @param {Function} done
   * @private
   */
  _parseCipherRequest(action, options, done) {
    let opts = this._parseOptions(options);
    let errors = this._validateOptions(opts);

    action.debugger('attempt with options (async): ' + JSON.stringify(opts));

    // Handle any validation errors. Perform the cipher if all is clear.
    this._handleErrors(errors).then(() => {
      this._cipher(action, opts, done);
    }, err => {
      action.debugger('encountered error: ' + err);
      done(err);
    });
  }

  /**
   * Handles any errors that may have occured during option validation.
   *
   * @param {Array} errors
   * @returns {Promise}
   * @private
   */
  _handleErrors(errors) {
    return new Promise((resolve, reject) => {
      if (errors.length) {
        let errorMessage = _.first(errors).message;
        let err = new Error(errorMessage);

        reject(err);
      } else {
        resolve();
      }
    });
  }

  /**
   * Cipher the file using the options provided with the given cipher method.
   *
   * @param {Object} action
   * @param {Object} options
   * @param {Function} done
   * @private
   */
  _cipher(action, options, done) {
    this._deriveKeyFromOptions(options, (err, key) => {
      if (err) {
        return done(err);
      }

      let readStream = fs.createReadStream(options.input);
      let writeStream = fs.createOutputStream(options.output);
      let handleError = this._handleStreamError(readStream, done);
      let cipher = this._generateCipherFromOptions(action, options, key);

      // Wait for the writable steam to finish, then call our "done" function.
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
    });
  }

  /**
   * A selected HMAC digest algorithm specified by digest is applied to derive a
   * key of the requested byte length (keylen) from the password, salt and
   * iterations.
   *
   * @param {Object} options
   * @param {Function} callback
   * @private
   */
  _deriveKeyFromOptions(options, callback) {
    crypto.pbkdf2(
      options.password,
      options.salt,
      options.iterations,
      options.keylen,
      options.digest,
      callback
    );
  }

  /**
   * Core synchronous methods.
   *
   * - _encryptSync()
   * - _decryptSync()
   * - _parseCipherRequestSync()
   * - _handleErrorsSync():Error
   * - _cipherSync()
   * - _deriveKeyFromOptionsSync():Hex
   */

  /**
   * The synchronous version of _encrypt().
   *
   * @see _parseCipherRequestSync
   * @param {Object} options
   * @private
   */
  _encryptSync(options) {
    this._parseCipherRequestSync(NodeCipher.Actions.ENCRYPT, options);
  }

  /**
   * The synchronous version of _decrypt().
   *
   * @see _parseCipherRequestSync
   * @param {Object} options
   * @private
   */
  _decryptSync(options) {
    this._parseCipherRequestSync(NodeCipher.Actions.DECRYPT, options);
  }

  /**
   * The synchronous version of _parseCipherRequest().
   *
   * @see _cipherSync
   * @param {Object} action
   * @param {Object} options
   * @private
   */
  _parseCipherRequestSync(action, options) {
    let opts = this._parseOptions(options);
    let errors = this._validateOptions(opts);
    let err = this._handleErrorsSync(errors);

    action.debugger('attempt with options (sync): ' + JSON.stringify(opts));

    // Handle any validation errors. Perform the cipher if all is clear.
    if (_.isUndefined(err)) {
      this._cipherSync(action, opts);
    } else {
      action.debugger('encountered error: ' + err);
      throw err;
    }
  }

  /**
   * The synchronous version of _handleErrors().
   *
   * @param {Array} errors
   * @private
   */
  _handleErrorsSync(errors) {
    if (errors.length) {
      let errorMessage = _.first(errors).message;
      let err = new Error(errorMessage);

      return err;
    }
  }

  /**
   * The synchronous version of _cipher().
   *
   * @param {Object} action
   * @param {Object} options
   * @private
   */
  _cipherSync(action, options) {
    try {
      let key = this._deriveKeyFromOptionsSync(options);
      let cipher = this._generateCipherFromOptions(action, options, key);
      let inputBuffer = fs.readFileSync(options.input);

      // Write the ciphered buffer to our output file.
      fs.writeFileSync(options.output, Buffer.concat([
        cipher.update(inputBuffer),
        cipher.final()
      ]));
    } catch (err) {
      throw err;
    }
  }

  /**
   * The synchronous version of _deriveKeyFromOptions().
   *
   * @param {Object} options
   * @returns {Hex}
   * @private
   */
  _deriveKeyFromOptionsSync(options) {
    return crypto.pbkdf2Sync(
      options.password,
      options.salt,
      options.iterations,
      options.keylen,
      options.digest
    );
  }

  /**
   * Helper methods.
   *
   * - _generateCipherFromOptions():Cipher
   * - _parseOptions():Object
   * - _validateOptions():Array
   * - _handleStreamError():Function
   */

  /**
   * Generates the desired cipheriv function from the given options and derived
   * key.
   *
   * @param {Object} action
   * @param {Object} options
   * @param {Buffer} key
   * @returns {Cipher}
   * @private
   */
  _generateCipherFromOptions(action, options, key) {
    return action.method(
      options.algorithm,
      key.toString('hex')
    );
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
    return _.flatten(
      _.map(options, (val, key) => {
        return validators[key](val);
      })
    );
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
   * Public methods.
   *
   * - encrypt()
   * - decrypt()
   * - encryptSync()
   * - decryptSync()
   * - listAlgorithms():Array
   * - listHashes():Array
   */

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
  listAlgorithms() {
    return constants.ALL_CIPHERS;
  }

  /**
   * Lists all valid HMAC hashes.
   *
   * @returns {Array}
   * @access public
   */
  listHashes() {
    return constants.ALL_HASHES;
  }

  /**
   * Public properties.
   *
   * - defaults:Object
   */

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
 * @enum {Object} Actions
 */
NodeCipher.Actions = {
  ENCRYPT: {
    name: 'encrypt',
    method: crypto.createCipher,
    debugger: debug('nodecipher:encrypt')
  },
  DECRYPT: {
    name: 'decrypt',
    method: crypto.createDecipher,
    debugger: debug('nodecipher:decrypt')
  }
};

/**
 * @enum {string} Defaults
 */
NodeCipher.Defaults = {
  input: defaults.INPUT,
  output: defaults.OUTPUT,
  password: defaults.PASSWORD,
  algorithm: defaults.ALGORITHM, // 'cast5-cbc'
  salt: defaults.SALT, // 'nodecipher'
  iterations: defaults.ITERATIONS, // 1000
  keylen: defaults.KEYLEN, // 512
  digest: defaults.DIGEST // 'sha1'
};

module.exports = new NodeCipher();
