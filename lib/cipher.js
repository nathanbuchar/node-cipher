/**
 * Encrypt or decrypt the given file, with or without a prompt for the password.
 *
 * @module lib/cipher
 * @author Nathan Buchar
 * @since 1.0.0
 */

var crypto = require('crypto');
var fs = require('fs');
var inquirer = require('inquirer');

var extend = require('extend');
var path = require('path');
var Promise = require('promise');
var validator = require('validator');

var defaults = require('./defaults');
var validators = require('./validators');

/**
 * Spawns the read and write Node streams.
 *
 * @param {Object} opts - Cipher options.
 * @returns {Object}
 * @private
 */
function spawnReadWriteStreams(opts) {
  return {
    read: fs.createReadStream(opts.input),
    write: fs.createWriteStream(opts.output)
  };
}

/**
 * Parses options by rewriting input and output paths as absolute and verifies
 * the cipher algorithm, substituting the default aglorithm if necessary.
 *
 * @param {Object} options - Cipher options.
 * @returns {Object}
 * @private
 */
function parseOptions(options) {
  return extend(options, {
    input: path.join(process.cwd(), options.input),
    output: path.join(process.cwd(), options.output),
    algorithm: parseAlgorithm(options.algorithm)
  });
}

/**
 * Issues a password prompt in the Terminal when a password is not strictly
 * passed in through the command line.
 *
 * @param {Function} callback - Callback function.
 * @private
 */
function issuePasswordPrompt(callback) {
  inquirer.prompt([{
    type: 'password',
    message: defaults.prompt.message,
    name: 'password',
    validate: validators.notEmpty
  }], function (answers) {
    callback(answers.password);
  });
}

/**
 * Verifies that the given algorithm is valid, or choose the default algorithm
 * if not specified.
 *
 * @param {string} [algorithm=cast5-cbc] - The cipher algorithm.
 * @returns {string}
 * @private
 */
function parseAlgorithm(algorithm) {
  if (typeof algorithm === 'undefined') {
    return defaults.cipher.algorithm;
  } else {
    var ciphers = crypto.getCiphers();

    if (ciphers.indexOf(algorithm) >= 0) {
      return algorithm;
    } else {
      throw new Error('"' + algorithm + '" is an invalid cipher algorithm.');
    }
  }
}

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
function performXcryption(options, cipher, callback) {
  return new Promise(function (resolve, reject) {
    var opts = parseOptions(options);
    var streams = spawnReadWriteStreams(opts);
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
}

/**
 * Verifies that a password is set before spawning the xcryption stteam. If no
 * password is specified, the user will be prompted to provide one via Terminal.
 *
 * @type {Function}
 * @param {Object} options   - Cipher options.
 * @param {Function} cipher - The Crypto cipher/decipher method.
 * @param {Function} [callback] - Callback function.
 * @returns {Promise}
 */
var xcrypt = module.exports.xcrypt = function (options, cipher, callback) {
  if (options.password) {
    return performXcryption.apply(null, arguments);
  } else {
    issuePasswordPrompt(function (password) {
      xcrypt(extend(options, {
        password: password
      }), cipher, callback);
    });
  }
};
