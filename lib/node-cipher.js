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
 * @description An array of all cipher algorithms.
 * @see {@link https://nodejs.org/api/crypto.html#crypto_crypto_getciphers}
 */
const ALL_CIPHERS = crypto.getCiphers();

/**
 * @const {Array} ALL_HASHES
 * @description An array of all HMAC hashes.
 * @see {@link https://nodejs.org/api/crypto.html#crypto_crypto_gethashes}
 */
const ALL_HASHES = crypto.getHashes();

/**
 * @const {string} DEFAULT_ALGORITHM
 * @description A cipher algorithm used in tandem with the derived key to create
 *   the cipher function that will be used to encrypt or decrypt the chosen
 *   input file. You may use `listAlgorithms()` to see a list of available
 *   cipher algorithms.
 * @default cast5-cbc
 */
const DEFAULT_ALGORITHM = 'cast5-cbc';

/**
 * @const {string} DEFAULT_SALT
 * @description A string used in tandem with the password, byte length, digest,
 *   and iterations to derive the encryption key. This should be as unique as
 *   possible and it's recommended that salts are random and their lengths are
 *  greater than 16 bytes.
 * @default nodecipher
 */
const DEFAULT_SALT = 'nodecipher';

/**
 * @const {number} DEFAULT_ITERATIONS
 * @description An integer representing the number of iterations used to derive
 *   the key. This is used in tandem with the password, salt, byte length, and
 *   digest to derive the encryption key. The higher the number of iterations,
 *   the more secure the derived key will be, but the longer it will take to
 *   complete.
 * @default 1000
 */
const DEFAULT_ITERATIONS = 1000;

/**
 * @const {number} DEFAULT_KEYLEN
 * @description An integer representing the desired byte length for the derived
 *   key. This is used in tandem with the password, salt, digest, and iterations
 *   to derive the encryption key.
 * @default 512
 */
const DEFAULT_KEYLEN = 512;

/**
 * @const {string} DEFAULT_DIGEST
 * @description An HMAC digest algorithm that will be used in tandem with the
 *   password, salt, byten length, and iterations to derive the key. You may use
 *   `listHashes()` to see a list of available HMAC hashes.
 * @default sha1
 */
const DEFAULT_DIGEST = 'sha1';

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
        return callback.call(scope, err);
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
        return callback.call(scope, err);
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

      return done(err);
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
        return done(null);
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
   * - _validateAlgorithm():Boolean
   * - _validateHash():Boolean
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
    let errors = NodeCipher.OptionsSchema.validate(options);

    // Verify that the chosen algorithm is valid.
    if (!this._validateAlgorithm(options.algorithm)) {
      errors.push({
        path: 'algorithm',
        message: `"${options.algorithm}" is not a valid cipher algorithm.`
      });
    }

    // Verify that the chosen digest is valid.
    if (!this._validateHash(options.digest)) {
      errors.push({
        path: 'digest',
        message: `"${options.digest}" is not a valid digest hash.`
      });
    }

    return errors;
  }

  /**
   * Verifies that the given algorithm is valid.
   *
   * @param {string} algorithm
   * @returns {boolean}
   * @private
   */
  _validateAlgorithm(algorithm) {
    return _.includes(ALL_CIPHERS, algorithm);
  }

  /**
   * Verifies that the given hash is valid.
   *
   * @param {string} hash
   * @returns {boolean}
   * @private
   */
  _validateHash(hash) {
    return _.includes(ALL_HASHES, hash);
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

      return callback(err);
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
 * @enum {string} Defaults
 */
NodeCipher.Defaults = {
  password: undefined,
  algorithm: DEFAULT_ALGORITHM, // 'cast5-cbc'
  salt: DEFAULT_SALT, // 'nodecipher'
  iterations: DEFAULT_ITERATIONS, // 1000
  keylen: DEFAULT_KEYLEN, // 512
  digest: DEFAULT_DIGEST // 'sha1'
};

module.exports = new NodeCipher();
