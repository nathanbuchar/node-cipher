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
let validate = require('validate');

/**
 * @const {Array} ALL_CIPHERS
 * @see {@link https://nodejs.org/api/crypto.html#crypto_crypto_getciphers}
 */
const ALL_CIPHERS = crypto.getCiphers();

/**
 * @const {Array} ALL_HASHES
 * @see {@link https://nodejs.org/api/crypto.html#crypto_crypto_gethashes}
 */
const ALL_HASHES = crypto.getHashes();

/**
 * @const {string} DEFAULT_SALT
 */
const DEFAULT_SALT = 'nodecipher';

/**
 * @const {number} DEFAULT_ITERATIONS
 */
const DEFAULT_ITERATIONS = 1000;

/**
 * @const {number} DEFAULT_KEYLEN
 */
const DEFAULT_KEYLEN = 512;

/**
 * @const {string} DEFAULT_DIGEST
 */
const DEFAULT_DIGEST = 'sha1';

/**
 * @const {string} DEFAULT_ALGORITHM
 */
const DEFAULT_ALGORITHM = 'cast5-cbc';

/**
 * @class NodeCipher
 */
class NodeCipher {

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

    // Check for errors.
    if (errors.length) {
      let errorMessage = _.first(errors).message;
      let err = new Error(errorMessage);

      action.debugger('encountered error: ' + errorMessage);

      return done(err);
    }

    this._cipher(action, opts, done);
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
      let cipher = action.method(options.algorithm, key.toString('hex'));

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

    action.debugger('attempt with options (sync): ' + JSON.stringify(opts));

    // Check for errors.
    if (errors.length) {
      let errorMessage = _.first(errors).message;
      let err = new Error(errorMessage);

      action.debugger('encountered error: ' + errorMessage);

      throw err;
    }

    this._cipherSync(action, opts);
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
      let inputBuffer = fs.readFileSync(options.input);
      let cipher = action.method(options.algorithm, key.toString('hex'));

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
   * @returns {hex}
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
    if (!_.includes(ALL_CIPHERS, options.algorithm)) {
      errors.push({
        path: 'algorithm',
        message: `"${options.algorithm}" is not a valid cipher algorithm.`
      });
    }

    // Verify that the chosen digest is valid.
    if (!_.includes(ALL_HASHES, options.digest)) {
      errors.push({
        path: 'digest',
        message: `"${options.digest}" is not a valid HMAC hash digest.`
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
   * Public API.
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
    return ALL_CIPHERS;
  }

  /**
   * Lists all valid HMAC hashes.
   *
   * @returns {Array}
   * @access public
   */
  listHashes() {
    return ALL_HASHES;
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
  salt: {
    type: 'string',
    required: true,
    message: '"salt" is required and must be a string.'
  },
  iterations: {
    type: 'number',
    required: true,
    message: '"iterations" is required and must be a number.'
  },
  keylen: {
    type: 'number',
    required: true,
    message: '"keylen" is required and must be a number.'
  },
  digest: {
    type: 'string',
    required: true,
    message: '"digest" is required and must be a string.'
  },
  algorithm: {
    type: 'string',
    required: true,
    message: '"algorithm" is required and must be a string.'
  }
});

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
 * @enum {string} defaults
 */
NodeCipher.Defaults = {
  password: undefined,
  salt: DEFAULT_SALT, // 'nodecipher'
  iterations: DEFAULT_ITERATIONS, // 1000
  keylen: DEFAULT_KEYLEN, // 512
  digest: DEFAULT_DIGEST, // 'sha1'
  algorithm: DEFAULT_ALGORITHM // 'cast5-cbc'
};

module.exports = new NodeCipher();
