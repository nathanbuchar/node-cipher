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
 * Encrypts the file without a prompt, given that the password is passed in as
 * a function parameter.
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
 * Decrypts the file without a prompt, given that the password is passed in as
 * a function parameter.
 *
 * @param {Object} options - Cipher options.
 * @param {Function} [callback] - Callback function.
 * @returns {Promise}
 * @access public
 */
module.exports.decrypt = function (options, callback) {
  return cipher.xcrypt(options, crypto.createDecipher, callback);
};
