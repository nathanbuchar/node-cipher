/**
 * Encrypt or decrypt the given file, with or without a prompt for the password.
 *
 * @module lib/cipher
 * @author Nathan Buchar
 * @since 1.0.0
 */

var crypto = require('crypto');
var extend = require('extend');
var fs = require('fs');
var Promise = require('promise');

var utils = require('./utils');

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
  return _xcrypt(options, crypto.createCipher, callback);
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
  return _xcrypt(options, crypto.createDecipher, callback);
};

/**
 * Handles both encryption or decryption based on the method passed into it.
 * If not password is specified, the user will be prompted to provide one via
 * Terminal.
 *
 * @param {Object} options - Cipher options.
 * @param {Function} cipher - The Crypto cipher/decipher method.
 * @param {Function} [callback] - Callback function.
 * @returns {Promise}
 * @see _cipher
 */
function _xcrypt(options, cipher, callback) {
  // Prompt user for password then call this function again after a
  // password has been provided (exiting early).
  if (!options.password) {
    return utils.promptUser().then(function (password) {
      _xcrypt(extend(options, {
        password: password
      }), cipher, callback);
    });
  }

  // We have everything we need; Perfom the cipher function.
  return _cipher(utils.parseOptions(options), cipher, callback);
}

/**
 * Encrypts or decrypts the given src file with a given password and optional
 * algorithm.
 *
 * @param {Object} options - Cipher options.
 * @param {Function} cipher - The Crypto cipher/decipher method.
 * @param {Function} [callback] - Callback function.
 * @returns {Promise}
 * @private
 */
function _cipher(options, cipher, callback) {
  return new Promise(function (resolve, reject) {
    var inputStream = fs.createReadStream(options.input);
    var outputStream = fs.createWriteStream(options.output);
    var fn = cipher(options.algorithm, options.password);

    // Callback when the stream ends.
    inputStream.on('end', function () {
      resolve();

      if (typeof callback !== 'undefined') {
        callback();
      }
    });

    // Pipe the readable input stream through our cipher method, created from our
    // chosen algorithm and password, and write the ciphered result into our
    // writable output stream.
    inputStream
      .pipe(fn)
      .pipe(outputStream);
  });
}
