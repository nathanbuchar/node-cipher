/**
 * Encrypt or decrypt the given file, with or without a prompt for the password.
 *
 * @module lib/cipher
 * @author Nathan Buchar
 * @since 1.0.0
 */

var crypto = require('crypto');
var fs = require('fs');
var extend = require('extend');
var inquirer = require('inquirer');
var path = require('path');
var promise = require('promise');

var defaults = require('./defaults');

/**
 * Parses the algorithm and returns the default value if necessary.
 *
 * @param {string} [algorithm=cast5-cbc] - The desired cipher algorithm.
 * @returns {string}
 */
function _parseAlgorithm(algorithm) {
  if (typeof algorithm !== 'undefined') {
    var ciphers = crypto.getCiphers();

    if (ciphers.indexOf(algorithm) >= 0) {
      return algorithm;
    } else {
      throw new Error('"' + algorithm + '" is an invalid cipher method.');
    }
  }

  return defaults.algorithm;
}

/**
 * Converts a relative file path into an absolute file path given that the
 * relative file path is relative to the current working directory.
 *
 * @param {string} file - The relative path of the file to use.
 * @returns {string}
 */
function _parseInputOutput(file) {
  return path.join(process.cwd(), file);
}

/**
 * Prompts the user for the encryption password.
 *
 * @param {Function} fn - Callback function to pass the answer back to.
 * @private
 */
function _promptUser(callback) {
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
}

/**
 * Encrypts or decrypts the given src file with a given password and optional
 * algorithm.
 *
 * @param {Object} options - Cipher options.
 * @param {Function} cipher - The Crypto cipher/decipher method.
 * @param {Function} [callback] - Callback function.
 * @private
 */
function _cipher(options, cipher, callback) {
  var inputStream = fs.createReadStream(options.input);
  var outputStream = fs.createWriteStream(options.output);
  var fn = cipher(options.algorithm, options.password);

  // Callback when the stream ends.
  inputStream.on('end', function () {
    callback();
  });

  // Pipe the readable input stream through our cipher method, created from our
  // chosen algorithm and password, and write the ciphered result into our
  // writable output stream.
  inputStream
    .pipe(fn)
    .pipe(outputStream);
}

/**
 * Handles both encryption or decryption based on the method passed into it.
 * If not password is specified, the user will be prompted to provide one via
 * Terminal.
 *
 * @param {Object} options - Cipher options.
 * @param {Function} cipher - The Crypto cipher/decipher method.
 * @param {Function} [callback] - Callback function.
 * @see _cipher
 */
function _xcrypt(options, cipher, callback) {
  if (!options.password) {
    _promptUser(function (password) {
      _xcrypt(extend(options, {
        password: password
      }), cipher, callback);
    });
  } else {
    _cipher(extend(options, {
      input: _parseInputOutput(options.input),
      output: _parseInputOutput(options.output),
      algorithm: _parseAlgorithm(options.algorithm)
    }), cipher, callback);
  }
}

/**
 * Encrypts the file without a prompt, given that the password is passed in as
 * a function parameter.
 *
 * @param {Object} options - Cipher options.
 * @param {Function} [callback] - Callback function.
 * @returns {Promise}
 * @see _xcrypt
 */
module.exports.encrypt = function (options, callback) {
  return new Promise(function (resolve, reject) {
    _xcrypt(options, crypto.createCipher, function () {
      if (typeof callback !== 'undefined') {
        callback();
      }

      resolve();
    });
  });
};

/**
 * Decrypts the file without a prompt, given that the password is passed in as
 * a function parameter.
 *
 * @param {Object} options - Cipher options.
 * @param {Function} [callback] - Callback function.
 * @returns {Promise}
 * @see _xcrypt
 */
module.exports.decrypt = function (options, callback) {
  return new Promise(function (resolve, reject) {
    _xcrypt(options, crypto.createDecipher, function () {
      if (typeof callback !== 'undefined') {
        callback();
      }

      resolve();
    });
  });
};
