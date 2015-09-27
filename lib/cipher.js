/**
 * Public node-cipher encryption and decryption API. Encrypt or decrypt the
 * given file, with or without a prompt for the password.
 *
 * @module lib/cipher
 * @author Nathan Buchar
 * @since 1.0.0
 */

'use strict';

var crypto = require('crypto');
var fs = require('fs');
var inquirer = require('inquirer');

var extend = require('extend');
var path = require('path');
var Promise = require('promise');

var defaults = require('./defaults');

/**
 * Declare internals.
 */
var internals = {};

/**
 * Encrypts a file with the provided options. This is the Node API, and a key
 * must be provided.
 *
 * @param {Object} options - Cipher options.
 * @param {Function} [callback] - Callback function.
 * @returns {Promise}
 * @access public
 */
exports.encrypt = function (options, callback) {
  if (options.key) {
    return internals._xcrypt(options, crypto.createCipher, callback);
  } else {
    throw new Error('Encryption key must be specified.');
  }
};

/**
 * Decrypts a file with the provided options. This is the Node API, and a key
 * must be provided.
 *
 * @param {Object} options - Cipher options.
 * @param {Function} [callback] - Callback function.
 * @returns {Promise}
 * @access public
 */
exports.decrypt = function (options, callback) {
  if (options.key) {
    return internals._xcrypt(options, crypto.createDecipher, callback);
  } else {
    throw new Error('Encryption key must be specified.');
  }
};

/**
 * Encrypts a file with the provided options. If no key is provided, a prompt
 * will be issued via Terminal. This is the CLI API and is not meant to
 * be used publicly.
 *
 * @param {Object} options - Cipher options.
 * @param {Function} [callback] - Callback function.
 * @access private
 */
exports._cliEncrypt = function (options, callback) {
  internals._xcrypt(options, crypto.createCipher, callback);
};

/**
 * Decrypts a file with the provided options. If no key is provided, a prompt
 * will be issued via Terminal. This is the CLI API and is not meant to
 * be used publicly.
 *
 * @param {Object} options - Cipher options.
 * @param {Function} [callback] - Callback function.
 * @access private
 */
exports._cliDecrypt = function (options, callback) {
  internals._xcrypt(options, crypto.createDecipher, callback);
};

/**
 * Lists all possible crypto ciphers options.
 *
 * @returns {Array}
 * @access public
 */
exports.list = function () {
  return crypto.getCiphers();
};

/**
 * Spawns the read and write Node streams.
 *
 * @param {Object} opts - Cipher options.
 * @returns {Object}
 * @private
 */
internals._spawnReadWriteStreams = function (opts) {
  return {
    read: fs.createReadStream(opts.input),
    write: fs.createWriteStream(opts.output)
  };
};

/**
 * Parses options by rewriting input and output paths as absolute and verifies
 * the cipher algorithm, substituting the default aglorithm if necessary.
 *
 * @param {Object} options - Cipher options.
 * @returns {Object}
 * @private
 */
internals._parseOptions = function (options) {
  return extend(options, {
    input: path.join(process.cwd(), options.input),
    output: path.join(process.cwd(), options.output),
    algorithm: internals._parseAlgorithm(options.algorithm)
  });
};

/**
 * Issues a password prompt in the Terminal when a password is not strictly
 * passed in through the command line.
 *
 * @param {Function} callback - Callback function.
 * @private
 */
internals._issuePasswordPrompt = function (callback) {
  inquirer.prompt([{
    type: 'password',
    message: 'Enter the encryption password',
    name: 'password',
    validate: function (input) {
      return input.length > 0;
    }
  }], function (answers) {
    callback(answers.password);
  });
};

/**
 * Verifies that the given algorithm is valid, or choose the default algorithm
 * if not specified.
 *
 * @param {string} [algorithm=cast5-cbc] - The cipher algorithm.
 * @returns {string}
 * @private
 */
internals._parseAlgorithm = function (algorithm) {
  if (typeof algorithm === 'undefined') {
    return defaults.cipher.algorithm;
  } else {
    if (crypto.getCiphers().indexOf(algorithm) >= 0) {
      return algorithm;
    } else {
      throw new Error('"' + algorithm + '" is an invalid cipher algorithm.');
    }
  }
};

/**
 * Perfom the appropriate encryption or decryption method. We define this
 * ambiguity as "xcryption".
 *
 * @param {Object} options   - Cipher options.
 * @param {Function} cipher - The Crypto cipher/decipher method.
 * @param {Function} [callback] - Callback function.
 * @returns {Promise}
 * @private
 */
internals._performXcryption = function (options, cipher, callback) {
  return new Promise(function (resolve, reject) {
    var opts = internals._parseOptions(options);
    var streams = internals._spawnReadWriteStreams(opts);
    var fn = cipher(opts.algorithm, opts.password);

    // Perfom applicable callback and resolve promise when the stream ends.
    streams.read.on('end', function () {
      resolve();

      if (callback) {
        callback();
      }
    });

    // Pipe the readable input stream through our cipher method, created from
    // our chosen algorithm and password, and write the ciphered result into
    // our writable output stream.
    streams.read.pipe(fn).pipe(streams.write);
  });
};

/**
 * Verifies that a password is set before spawning the xcryption stream. If
 * no password is specified, the user will be prompted to provide one via
 * Terminal.
 *
 * @param {Object} options - Cipher options.
 * @param {Function} cipher - The Crypto cipher/decipher method.
 * @param {Function} [callback] - Callback function.
 * @returns {Promise} - NOTE: Only if a prompt is not issued.
 * @private
 */
internals._xcrypt = function (options, cipher, callback) {
  if (options.password) {
    return internals._performXcryption.apply(null, arguments);
  } else {
    internals._issuePasswordPrompt(function (password) {
      internals._xcrypt(extend(options, {
        password: password
      }), cipher, callback);
    });
  }
};
