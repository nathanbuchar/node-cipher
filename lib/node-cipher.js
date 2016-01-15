/**
 * NodeCipher class definition.
 *
 * @module lib/nodeCipher
 * @author Nathan Buchar
 * @since 3.0.0
 */

'use strict';

let _ = require('lodash');
let assert = require('assert');
let crypto = require('crypto');
let fs = require('fs');

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
     * @default null
     * @private
     */
    this._algorithms = null;

    this._init();
  }

  /**
   * Initialize this NodeCipher instance.
   *
   * @private
   */
  _init() {
    this._algorithms = crypto.getCiphers();
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
    let opts = this._parseOptions(options);
    let cipher = method(opts.algorithm, opts.password);
    let streams = this._createReadWriteSteams(opts.input, opts.output);

    // Wait for the steam to end, then call our "done" function.
    streams.read.on('end', () => {
      done(null);
    });

    // Pipe the readable input stream through our cipher method, created from
    // our chosen algorithm and password, and write the ciphered result into
    // our writable output stream.
    streams.read.on('error', err => {
      done(err);
    }).pipe(cipher).on('error', err => {
      done(err);
    }).pipe(streams.write).on('error', err => {
      done(err);
    });
  }

  /**
   * Spawns the read and write Node streams.
   *
   * @param {string} input
   * @param {string} output
   * @returns {Object}
   * @private
   */
  _createReadWriteSteams(input, output) {
    return {
      read: fs.createReadStream(input),
      write: fs.createWriteStream(output)
    };
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
    let opts = _.defaults(options, NodeCipher.Defaults);

    this._validateOptions(opts);

    return opts;
  }

  /**
   * Validates that all NodeCipher options follow the proper schema.
   *
   * @param {Object} options
   * @private
   */
  _validateOptions(options) {
    this._validateInputOption(options.input);
    this._validateInputOption(options.output);
    this._validateAlgorithmOption(options.algorithm);
    this._validatePasswordOption(options.password);
  }

  /**
   * Validates the the "input" option is not undefined, and a string.
   *
   * @see _validateOptions
   * @param {string} opt
   * @private
   */
  _validateInputOption(opt) {

    // Verify that the option exists.
    assert(!_.isUndefined(opt), '"input" must be specified.');

    // Verify that the option is a string.
    assert(_.isString(opt), '"input" must be a string.');
  }

  /**
   * Validates the the "output" option is not undefined, and a string.
   *
   * @see _validateOptions
   * @param {string} opt
   * @private
   */
  _validateOutputOption(opt) {

    // Verify that the option exists.
    assert(!_.isUndefined(opt), '"output" must be specified.');

    // Verify that the option is a string.
    assert(_.isString(opt), '"output" must be a string.');
  }

  /**
   * Validates the the "algorithm" option is not undefined, a string, and not
   * invalid.
   *
   * @see _validateOptions
   * @param {string} opt
   * @private
   */
  _validateAlgorithmOption(opt) {

    // Verify that the option exists.
    assert(!_.isUndefined(opt), '"algorithm" must be specified.');

    // Verify that the option is a string.
    assert(_.isString(opt), '"algorithm" option must be a string.');

    // Verify that the algorithm is valid.
    assert(_.includes(this._algorithms, opt), '"' + opt + '" is not a valid ' +
      'cipher algorithm.');
  }

  /**
   * Validates the the "output" option is not undefined, and a string.
   *
   * @see _validateOptions
   * @param {string} opt
   * @private
   */
  _validatePasswordOption(opt) {

    // Verify that the option exists.
    assert(!_.isUndefined(opt), '"password" must be specified.');

    // Verify that the option is a string.
    assert(_.isString(opt), '"password" must be a string.');
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
   * Public method for synchronously encrypting using the options provided.
   *
   * @param {Object} options
   * @access public
   */
  encryptSync(options) {
    // TODO
    throw new Error('decryptSync not yet implemented. I\'ll accept PR\'s');
  }

  /**
   * Public method for synchronously decrypting using the options provided.
   *
   * @param {Object} options
   * @access public
   */
  decryptSync(options) {
    // TODO
    throw new Error('decryptSync not yet implemented. I\'ll accept PR\'s');
  }

  /**
   * Lists all valid cipher algorithms.
   *
   * @access public
   */
  list() {
    return this.algorithms;
  }

  /**
   * Gets all valid cipher algorithms.
   *
   * @returns {Array}
   * @access public
   */
  get algorithms() {
    return this._algorithms;
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

  /**
   * Gets NodeCipher commands.
   *
   * @returns {Array}
   * @access public
   */
  get commands() {
    return NodeCipher.Commands;
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
 * @enum {Array} Commands
 */
NodeCipher.Commands = [
  'encrypt',
  'decrypt'
];

module.exports = new NodeCipher();
