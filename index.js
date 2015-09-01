/**
 * Public node-cipher encryption and decryption API.
 *
 * @module main
 * @author Nathan Buchar
 * @since 2.3.0
 */

var crypto = require('crypto');

var cipher = require('./lib/cipher');

/**
 * Encrypts a file with the provided options. If no password is provided, the
 * user will be prompted to enter a password via Terminal.
 *
 * @param {Object} options - Cipher options.
 * @param {Function} [callback] - Callback function.
 * @returns {Promise}
 * @access public
 */
module.exports.encrypt = function (options, callback) {
  return cipher.xcrypt(options, crypto.createCipher, callback);
};

/**
 * Decrypts a file with the provided options. If no password is provided, the
 * user will be prompted to enter a password via Terminal.
 *
 * @param {Object} options - Cipher options.
 * @param {Function} [callback] - Callback function.
 * @returns {Promise}
 * @access public
 */
module.exports.decrypt = function (options, callback) {
  return cipher.xcrypt(options, crypto.createDecipher, callback);
};

/**
 * Lists all possible crypto ciphers options.
 *
 * @returns {Array}
 * @access public
 */
module.exports.list = function () {
  return crypto.getCiphers();
};
