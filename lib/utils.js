/**
 * Cipher utility functions.
 *
 * @module lib/utils
 * @author Nathan Buchar
 * @since 2.2.0
 */

var crypto = require('crypto');
var extend = require('extend');
var inquirer = require('inquirer');
var path = require('path');
var Promise = require('promise');

var defaults = require('./defaults');

/**
 * Prompts the user for the encryption password.
 *
 * @returns {Promise}
 */
module.exports.promptUser = function () {
  return new Promise(function (resolve, reject) {
    inquirer.prompt([{
      type: 'password',
      message: 'Enter the encryption password',
      name: 'password',
      validate: function (input) {
        return input.length > 0;
      }
    }], function (answers) {
      resolve(answers.password);
    });
  });
};

/**
 * Parses nodecipher options.
 *
 * @param {Object} options
 * @returns {Object}
 */
module.exports.parseOptions = function (options) {
  return extend(options, {
    input: _parseRelativeFilepath(options.input),
    output: _parseRelativeFilepath(options.output),
    algorithm: _parseAlgorithm(options.algorithm)
  });
};

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
function _parseRelativeFilepath(file) {
  return path.join(process.cwd(), file);
}
