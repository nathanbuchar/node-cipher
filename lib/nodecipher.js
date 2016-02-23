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
let keyMirror = require('keymirror');
let rc = require('rc');

/**
 * @const {string} APP_NAME
 * @description The Node-Cipher app name.
 */
const APP_NAME = 'nodecipher';

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
 * @description A cipher algorithm used in tandem with the derived key to
 *   create the cipher function that will be used to encrypt or decrypt the
 *   chosen input file. You may use `listAlgorithms()` to see a list of
 *   available cipher algorithms.
 */
const DEFAULT_ALGORITHM = 'cast5-cbc';

/**
 * @const {string|Buffer} DEFAULT_SALT
 * @description A string or buffer used in tandem with the password, byte
 *   length, digest, and iterations to derive the encryption key. This should
 *   be as unique as possible and it's recommended that salts are random and
 *   their lengths are greater than 16 bytes.
 */
const DEFAULT_SALT = 'nodecipher';

/**
 * @const {number} DEFAULT_ITERATIONS
 * @description An integer representing the number of iterations used to
 *   derive the key. This is used in tandem with the password, salt, byte
 *   length, and digest to derive the encryption key. The higher the number of
 *   iterations, the more secure the derived key will be, but the longer it
 *   will take to complete.
 */
const DEFAULT_ITERATIONS = 1000;

/**
 * @const {number} DEFAULT_KEYLEN
 * @description An integer representing the desired byte length for the
 *   derived key. This is used in tandem with the password, salt, digest, and
 *   iterations to derive the encryption key.
 */
const DEFAULT_KEYLEN = 512;

/**
 * @const {string} DEFAULT_DIGEST
 * @description An HMAC digest algorithm that will be used in tandem with the
 *   password, salt, byten length, and iterations to derive the key. You may
 *   use `listHashes()` to see a list of available HMAC hashes.
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
   * NodeCipher class constructor.
   */
  constructor() {

    /**
     * @prop {Object} _config
     * @default null
     * @private
     */
    this._config = null;

    this._init();
  }

  /**
   * Initializes the NodeCipher instance.
   *
   * @private
   */
  _init() {
    this._initConfig();
  }

  /**
   * Loads in the `.nodecipherrc` file if one exists, extended by the NodeCipher
   * defaults.
   *
   * @private
   */
  _initConfig() {
    let defaults = _.clone(NodeCipher.Defaults);
    let properties = _.keys(NodeCipher.Defaults);
    let config = rc(APP_NAME, defaults);

    this._config = _.pick(config, properties);
  }

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
    let action = NodeCipher.Actions.ENCRYPT;

    this._parseCipherRequest(action, options, (err, opts) => {
      if (_.isFunction(callback)) {
        return callback.call(scope, err, opts);
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
    let action = NodeCipher.Actions.DECRYPT;

    this._parseCipherRequest(action, options, (err, opts) => {
      if (_.isFunction(callback)) {
        return callback.call(scope, err, opts);
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
        let error = _.first(errors);
        let err = new Error(error.message);

        if (!_.isUndefined(error.name)) {
          err.name = error.name;
        }

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
        return done(null, options);
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
   * - _encryptSync():Object
   * - _decryptSync():Object
   * - _parseCipherRequestSync():Object
   * - _handleErrorsSync():Error
   * - _cipherSync():Object
   * - _deriveKeyFromOptionsSync():Hex
   */

  /**
   * The synchronous version of _encrypt().
   *
   * @see _parseCipherRequestSync
   * @param {Object} options
   * @returns {Object}
   * @private
   */
  _encryptSync(options) {
    return this._parseCipherRequestSync(NodeCipher.Actions.ENCRYPT, options);
  }

  /**
   * The synchronous version of _decrypt().
   *
   * @see _parseCipherRequestSync
   * @param {Object} options
   * @returns {Object}
   * @private
   */
  _decryptSync(options) {
    return this._parseCipherRequestSync(NodeCipher.Actions.DECRYPT, options);
  }

  /**
   * The synchronous version of _parseCipherRequest().
   *
   * @see _cipherSync
   * @param {Object} action
   * @param {Object} options
   * @returns {Object}
   * @private
   */
  _parseCipherRequestSync(action, options) {
    let opts = this._parseOptions(options);
    let errors = this._validateOptions(opts);
    let err = this._handleErrorsSync(errors);

    action.debugger('attempt with options (sync): ' + JSON.stringify(opts));

    // Handle any validation errors. Perform the cipher if all is clear.
    if (_.isUndefined(err)) {
      return this._cipherSync(action, opts);
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
   * @returns {Object} options
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

      return options;
    } catch (err) {
      if (err.code === 'ENOENT') {
        err.name = NodeCipher.Errors.BAD_FILE;
      } else {
        err.name = NodeCipher.Errors.BAD_DECRYPT;
      }

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
   * - _validateRequiredString():Array
   * - _validateRequiredStringOrBuffer():Array
   * - _validateRequiredInteger():Array
   * - _validateRequiredHash():Array
   * - _validateRequiredCipher():Array
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
    return _.defaults(options, this._config);
  }

  /**
   * Validates that all NodeCipher options follow the proper schema.
   *
   * @param {Object} options
   * @returns {Array} errors
   * @private
   */
  _validateOptions(options) {
    return Array.prototype.concat(
      this._validateRequiredString('input', options.input),
      this._validateRequiredString('output', options.output),
      this._validateRequiredString('password', options.password),
      this._validateRequiredStringOrBuffer('salt', options.salt),
      this._validateRequiredInteger('iterations', options.iterations),
      this._validateRequiredInteger('keylen', options.keylen),
      this._validateRequiredHash('digest', options.digest),
      this._validateRequiredCipher('algorithm', options.algorithm)
    );
  }

  /**
   * Validates an option that is required and must be a string.
   *
   * @param {string} key
   * @param {mixed} val
   * @returns {Array} errors
   * @private
   */
  _validateRequiredString(key, val) {
    let errors = [];

    if (_.isUndefined(val)) {
      errors.push({
        option: key,
        message: `"${key}" is required.`
      });
    }

    if (!_.isString(val)) {
      errors.push({
        name: key,
        message: `"${key}" must be a string. Got "${typeof val}"`
      });
    }

    return errors;
  }

  /**
   * Validates an option that is required and must be a string or a Buffer.
   *
   * @param {string} key
   * @param {mixed} val
   * @returns {Array} errors
   * @private
   */
  _validateRequiredStringOrBuffer(key, val) {
    let errors = [];

    if (_.isUndefined(val)) {
      errors.push({
        option: key,
        message: `"${key}" is required.`
      });
    }

    if (!_.isString(val) && !Buffer.isBuffer(val)) {
      errors.push({
        option: key,
        message: `"${key}" must be a string or buffer. Got "${typeof val}"`
      });
    }

    return errors;
  }

  /**
   * Validates an option that is required and must be an integer.
   *
   * @param {string} key
   * @param {mixed} val
   * @returns {Array} errors
   * @private
   */
  _validateRequiredInteger(key, val) {
    let errors = [];

    if (_.isUndefined(val)) {
      errors.push({
        option: key,
        message: `"${key}" is required.`
      });
    }

    if (!_.isInteger(val)) {
      errors.push({
        option: key,
        message: `"${key}" must be an integer. Got "${typeof val}"`
      });
    }

    return errors;
  }

  /**
   * Validates an option that is required that must be a string and be a valid
   * HMAC digest hash.
   *
   * @param {string} key
   * @param {mixed} val
   * @returns {Array} errors
   * @private
   */
  _validateRequiredHash(key, val) {
    let errors = [];

    if (_.isUndefined(val)) {
      errors.push({
        option: key,
        message: `"${key}" is required.`
      });
    }

    if (!_.isString(val)) {
      errors.push({
        option: key,
        message: `"${key}" must be a string. Got "${typeof val}"`
      });
    }

    if (!_.includes(ALL_HASHES, val)) {
      errors.push({
        option: key,
        message: `"${val}" is not a valid digest hash.`,
        name: NodeCipher.Errors.BAD_DIGEST
      });
    }

    return errors;
  }

  /**
   * Validates an option that is required that must be a string and be a valid
   * cipher algorithm.
   *
   * @param {string} key
   * @param {mixed} val
   * @returns {Array} errors
   * @private
   */
  _validateRequiredCipher(key, val) {
    let errors = [];

    if (_.isUndefined(val)) {
      errors.push({
        option: key,
        message: `"${key}" is required.`
      });
    }

    if (!_.isString(val)) {
      errors.push({
        option: key,
        message: `"${key}" must be a string. Got "${typeof val}"`
      });
    }

    if (!_.includes(ALL_CIPHERS, val)) {
      errors.push({
        option: key,
        message: `"${val}" is not a valid cipher algorithm.`,
        name: NodeCipher.Errors.BAD_ALGORITHM
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

      if (err.code === 'ENOENT') {
        err.name = NodeCipher.Errors.BAD_FILE;
      } else {
        err.name = NodeCipher.Errors.BAD_DECRYPT;
      }

      return callback(err);
    };
  }

  /**
   * Public methods.
   *
   * - encrypt()
   * - decrypt()
   * - encryptSync():Object
   * - decryptSync():Object
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
   * @returns {Object}
   * @access public
   */
  encryptSync(options) {
    return this._encryptSync.apply(this, arguments);
  }

  /**
   * The synchronous version of decrypt().
   *
   * @see _decryptSync
   * @param {Object} options
   * @returns {Object}
   * @access public
   */
  decryptSync(options) {
    return this._decryptSync.apply(this, arguments);
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
   * - config:Object
   * - defaults:Object
   * - errors:Object
   */

  /**
   * Gets the NodeCipher instance configuration.
   *
   * @returns {Object}
   * @access public
   */
  get config() {
    return this._config;
  }

  /**
   * Gets a clone of the NodeCipher defaults.
   *
   * @returns {Object}
   * @access public
   */
  get defaults() {
    return _.clone(NodeCipher.Defaults);
  }

  /**
   * Gets a clone of the NodeCipher error names.
   *
   * @returns {Object}
   * @access public
   */
  get errors() {
    return _.clone(NodeCipher.Errors);
  }
}

/**
 * NodeCipher action objects.
 *
 * @type {Object}
 * @readonly
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
 * NodeCipher error names.
 *
 * @type {string}
 * @readonly
 */
NodeCipher.Errors = {
  BAD_ALGORITHM: 'Bad Algorithm',
  BAD_DIGEST: 'Bad Digest',
  BAD_FILE: 'Bad File',
  BAD_DECRYPT: 'Bad Decrypt'
};

/**
 * Default NodeCipher options.
 *
 * @type {string}
 * @readonly
 */
NodeCipher.Defaults = {
  input: undefined,
  output: undefined,
  password: undefined,
  algorithm: DEFAULT_ALGORITHM,
  salt: DEFAULT_SALT,
  digest: DEFAULT_DIGEST,

  /** @type {number} */
  iterations: DEFAULT_ITERATIONS,

  /** @type {number} */
  keylen: DEFAULT_KEYLEN
};

module.exports = new NodeCipher();
