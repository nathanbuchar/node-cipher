/**
 * Encrypt or decrypt the given file, with or without a prompt for the key.
 *
 * @module lib/cipher
 * @author Nathan Buchar
 * @since 1.0.0
 */

var crypto = require('crypto');
var fs = require('fs');
var inquirer = require('inquirer');

var defaults = require('./defaults');

/**
 * Parses the algorithm and returns the default value if necessary.
 *
 * @param {string} [algorithm=AES-128-CBC] - The desired cipher algorithm.
 * @returns {string}
 */
function parseAlgorithm(algorithm) {
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
 * Prompts the user for the encryption key.
 *
 * @param {string} message - The prompt to display.
 * @param {Function} fn - Callback function to pass the answer back to.
 * @private
 */
function promptUser(message, fn) {
  inquirer.prompt([{
    type: 'password',
    message: message,
    name: 'key'
  }], function (answers) {
    fn.call(null, answers.key);
  });
}

/**
 * Decrypts the given src file with a given key and optional algorithm.
 *
 * @param {string} src - The source file path (absolute).
 * @param {string} dest - The destination file path (absolute).
 * @param {string} key - The encryption key.
 * @param {Function} method - The crypto method (cipher or decipher).
 * @param {string} [algorithm=AES-128-CBC] - The desired cipher algorithm.
 * @see cipher
 * @private
 */
function cipher(src, dest, key, method, algorithm) {
  algorithm = parseAlgorithm(algorithm);

  var sourceStream = fs.createReadStream(src);
  var destStream = fs.createWriteStream(dest);
  var action = method(algorithm, key);

  sourceStream.pipe(action).pipe(destStream);
}

/**
 * Encrypts the given src file with a given key and optional algorithm.
 *
 * @param {string} src - The source file path (absolute).
 * @param {string} dest - The destination file path (absolute).
 * @param {string} key - The encryption key.
 * @param {string} [algorithm] - The desired cipher algorithm.
 * @see cipher
 * @private
 */
function encrypt(src, dest, key, algorithm) {
  cipher(src, dest, key, crypto.createCipher, algorithm);
}

/**
 * Decrypts the given src file with a given key and optional algorithm.
 *
 * @param {string} src - The source file path (absolute).
 * @param {string} dest - The destination file path (absolute).
 * @param {string} key - The encryption key.
 * @param {string} [algorithm] - The desired cipher algorithm.
 * @see cipher
 * @private
 */
function decrypt(src, dest, key, algorithm) {
  cipher(src, dest, key, crypto.createDecipher, algorithm);
}

/**
 * Prompts the user for the encryption key, then calls the encryption method.
 *
 * @param {string} src - The source file path (absolute).
 * @param {string} dest - The destination file path (absolute).
 * @param {string} [algorithm] - The desired cipher algorithm.
 * @param {Functoin} [fn] - Callback function.
 * @see promptUser
 * @see encrypt
 */
module.exports.encryptWithPrompt = function (src, dest, algorithm, fn) {
  promptUser('Enter an encryption key', function (key) {
    encrypt.call(null, src, dest, key, algorithm);

    if (typeof fn !== 'undefined') {
      fn.call();
    }
  });
};

/**
 * Encrypts the file without a prompt, given that the key is passed in as a
 * function parameter.
 *
 * @param {string} src - The source file path (absolute).
 * @param {string} dest - The destination file path (absolute).
 * @param {string} key - The encryption key.
 * @param {string} [algorithm] - The desired cipher algorithm.
 * @param {Functoin} [fn] - Callback function.
 * @see encrypt
 */
module.exports.encrypt = function (src, dest, key, algorithm, fn) {
  encrypt.call(null, src, dest, key, algorithm);

  if (typeof fn !== 'undefined') {
    fn.call();
  }
};

/**
 * Prompts the user for the encryption key, then calls the decryption method.
 *
 * @param {string} src - The source file path (absolute).
 * @param {string} dest - The destination file path (absolute).
 * @param {string} [algorithm] - The desired cipher algorithm.
 * @param {Functoin} [fn] - Callback function.
 * @see promptUser
 * @see decrypt
 */
module.exports.decryptWithPrompt = function (src, dest, algorithm, fn) {
  promptUser('Enter the encryption key', function (key) {
    decrypt.call(null, src, dest, key, algorithm);

    if (typeof fn !== 'undefined') {
      fn.call();
    }
  });
};

/**
 * Decrypts the file without a prompt, given that the key is passed in as a
 * function parameter.
 *
 * @param {string} src - The source file path (absolute).
 * @param {string} dest - The destination file path (absolute).
 * @param {string} key - The encryption key.
 * @param {string} [algorithm] - The desired cipher algorithm.
 * @param {Functoin} [fn] - Callback function.
 * @see decrypt
 */
module.exports.decrypt = function (src, dest, key, algorithm, fn) {
  decrypt.call(null, src, dest, key, algorithm);

  if (typeof fn !== 'undefined') {
    fn.call();
  }
};
