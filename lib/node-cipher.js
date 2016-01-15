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
let fs = require('fs');
let validate = require('validate');

/**
 * Helper function that performs no operation.
 */
function noop() {}

/**
 * @class NodeCipher
 */
class NodeCipher {

  /**
   * NodeCipher instance constructor.
   *
   * @constructor
   */
  constructor() {

    /**
     * @prop {Array} _algorithms
     * @private
     */
    this._algorithms = crypto.getCiphers();
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
    if (!_.includes(this._algorithms, options.algorithm)) {
      errors.push({
        path: 'algorithm',
        message: `"${options.algorithm}" is not a valid cipher algorithm.`
      });
    }

    return errors;
  }

  /**
   * Encrypt using the options provided.
   *
   * @see _xcrypt
   * @param {Object} options
   * @param {Function} [callback=noop]
   * @param {Object} [scope=null]
   * @private
   */
  _encrypt(options, callback, scope) {
    callback = !_.isUndefined(callback) ? callback : noop;
    scope = !_.isUndefined(scope) ? scope : null;

    let opts = this._parseOptions(options);
    let errors = this._validateOptions(opts);

    // Return errors back to the user and exit early.
    if (errors.length) {
      return callback.call(scope, new Error(errors[0].message));
    }

    this._xcrypt(options, NodeCipher.Methods.CIPHER, err => {
      callback.call(scope, err);
    });
  }

  /**
   * Decrypt using the options provided.
   *
   * @see _xcrypt
   * @param {Object} options
   * @param {Function} [callback=noop]
   * @param {Object} [scope=null]
   * @private
   */
  _decrypt(options, callback, scope) {
    callback = !_.isUndefined(callback) ? callback : noop;
    scope = !_.isUndefined(scope) ? scope : null;

    let opts = this._parseOptions(options);
    let errors = this._validateOptions(opts);

    // Return errors back to the user and exit early.
    if (errors.length) {
      return callback.call(scope, new Error(errors[0].message));
    }

    this._xcrypt(options, NodeCipher.Methods.DECIPHER, err => {
      callback.call(scope, err);
    });
  }

  /**
   * Perfom the appropriate encryption or decryption method with the given
   * options. We define this ambiguity as "xcryption".
   *
   * @param {Object} options
   * @param {Crypto.<Cipher|Decipher>} method
   * @param {Function} done
   * @private
   */
  _xcrypt(options, method, done) {
    let readStream = fs.createReadStream(options.input);
    let writeStream = fs.createWriteStream(options.output);
    let cipher = method(options.algorithm, options.password);

    // Wait for the writable steam to end, then call our "done" function.
    writeStream.on('finish', () => {
      done(null);
    });

    // Pipe the readable input stream through our cipher method, created from
    // our chosen algorithm and password, and write the ciphered result into
    // our writable output stream.
    readStream.on('error', err => {
      readStream.unpipe();
      done(err);
    }).pipe(cipher).on('error', err => {
      readStream.unpipe();
      done(err);
    }).pipe(writeStream).on('error', err => {
      readStream.unpipe();
      done(err);
    });
  }

  /**
   * The synchronous version of _encrypt().
   *
   * @see _xcryptSync
   * @param {Object} options
   * @private
   */
  _encryptSync(options) {
    let opts = this._parseOptions(options);
    let errors = this._validateOptions(opts);

    // Handle errors.
    if (errors.length) {
      throw new Error(errors[0].message);
    }

    this._xcryptSync(opts, NodeCipher.Methods.CIPHER);
  }

  /**
   * The synchronous version of _decrypt().
   *
   * @see _xcryptSync
   * @param {Object} options
   * @private
   */
  _decryptSync(options) {
    let opts = this._parseOptions(options);
    let errors = this._validateOptions(opts);

    // Handle errors.
    if (errors.length) {
      throw new Error(errors[0].message);
    }

    this._xcryptSync(opts, NodeCipher.Methods.DECIPHER);
  }

  /**
   * The synchronous version of _xcrypt().
   *
   * @param {Object} options
   * @param {Crypto.<Cipher|Decipher>} method
   * @private
   */
  _xcryptSync(options, method) {
    try {
      let inputBuffer = fs.readFileSync(options.input);
      let cipher = method(options.algorithm, options.password);

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
   * Public method for encrypting using the options provided.
   *
   * @see _encrypt
   * @param {Object} options
   * @param {Function} [callback]
   * @param {Object} [scope]
   * @access public
   */
  encrypt(options, callback, scope) {
    this._encrypt(options, callback, scope);
  }

  /**
   * Public method for decrypting using the options provided.
   *
   * @see _decrypt
   * @param {Object} options
   * @param {Function} [callback]
   * @param {Object} [scope]
   * @access public
   */
  decrypt(options, callback, scope) {
    this._decrypt(options, callback, scope);
  }

  /**
   * The synchronous version of encrypt().
   *
   * @see _encryptSync
   * @param {Object} options
   * @access public
   */
  encryptSync(options) {
    this._encryptSync(options);
  }

  /**
   * The synchronous version of decrypt().
   *
   * @see _decryptSync
   * @param {Object} options
   * @access public
   */
  decryptSync(options) {
    this._decryptSync(options);
  }

  /**
   * Lists all valid cipher algorithms.
   *
   * @returns {Array}
   * @access public
   */
  list() {
    return this.algorithms;
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
 * @enum {Object} Methods
 */
NodeCipher.Methods = {
  CIPHER: crypto.createCipher,
  DECIPHER: crypto.createDecipher
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
