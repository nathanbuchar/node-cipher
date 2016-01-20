/**
 * @fileoverview Handles the encrypt and decrypt commands.
 * @author Nathan Buchar
 */

'use strict';

let _ = require('lodash');
let chalk = require('chalk');
let inquirer = require('inquirer');

let nodecipher = require('../../');

/**
 * Prompts the user to supply a password via Inquirer.
 *
 * @param {Function} done
 */
function prompForPassword(done) {
  inquirer.prompt([{
    type: 'password',
    message: 'Enter the password',
    name: 'password',
    validate(input) {
      return input.length > 0;
    }
  }], answers => {
    done(answers.password);
  });
}

/**
 * Parses the command line options into a more consise Object that will be
 * accepted by NodeCipher.
 *
 * @param {Object} options
 * @returns {Object} opts;
 */
function parseOptions(options) {
  let opts = {};

  _.each(nodecipher.defaults, (defaultVal, name) => {
    if (!_.isUndefined(options[name])) {
      opts[name] = options[name];
    }
  });

  return opts;
}

/**
 * First checks if the password has been supplied. If not, the user is prompted
 * to provide one. Once the password is received, parse the options and then
 * call the appropriate NodeCipher method with the given options.
 *
 * @see prompForPassword
 * @see handleCipher
 * @param {string} command
 * @param {string} input
 * @param {string} output
 * @param {Object} Options
 */
function cipher(command, input, output, options) {
  if (_.isUndefined(options.password)) {
    prompForPassword(password => {
      cipher(command, input, output, options, _.assign(password, options));
    });
  } else {
    let opts = _.assign({ input, output }, parseOptions(options));

    nodecipher[command](opts, err => {
      handleCipher(opts, err);
    });
  }
}

/**
 * Called when the cipher has completed. Handles errors if there are any.
 *
 * @param {Object} opts
 * @param {Error|null} err
 */
function handleCipher(opts, err) {
  if (err) {
    if (err.code === 'ENOENT') {
      handleEnoentError(opts, err);
    } else if (err.toString().indexOf('bad decrypt') >= 0) {
      handleBadDecrypt(opts, err);
    } else if (err.toString().indexOf('wrong final block length') >= 0) {
      handleIncorrectAlgorithm(opts, err);
    } else if (err.toString().indexOf('not a valid cipher algorithm') >= 0) {
      handleInvalidAlgorithm(opts, err);
    } else if (err.toString().indexOf('not a valid HMAC hash') >= 0) {
      handleInvalidHash(opts, err);
    } else {
      handleUnknownErrors(opts, err);
    }
  } else {
    handleCipherSuccess(opts, err);
  }
}

/**
 * Handles NodeCipher ENOENT errors.
 *
 * @param {Object} opts
 * @param {Error} err
 */
function handleEnoentError(opts, err) {
  console.log(chalk.red(
    '\nError: ' + err.path + ' does not exist\n'
  ));
}

/**
 * Handles bad encryption key derivation
 *
 * @param {Object} opts
 * @param {Error} err
 */
function handleBadDecrypt(opts, err) {
  console.log(chalk.red(
    '\nBad decrypt. One or more of the following may be incorrect:\n\n' +
      '  - password\n' +
      '  - vector\n' +
      '  - salt\n' +
      '  - iterations\n' +
      '  - keylen\n' +
      '  - digest\n'
  ));
}

/**
 * Handles wrong final block length (wrong algorithm).
 *
 * @param {Object} opts
 * @param {Error} err
 */
function handleIncorrectAlgorithm(opts, err) {
  console.log(chalk.red(
    '\nBad decrypt. Incorrect cipher algorithm\n'
  ));
}

/**
 * Handles invalid cipher algorithm.
 *
 * @param {Object} opts
 * @param {Error} err
 */
function handleInvalidAlgorithm(opts, err) {
  console.log(chalk.red(
    '\n' + err + ' Use `nodecipher --algorithms` to see a list of valid ' +
    'algorithms\n'));
}

/**
 * Handles invalid HMAC hash digest.
 *
 * @param {Object} opts
 * @param {Error} err
 */
function handleInvalidHash(opts, err) {
  console.log(chalk.red(
    '\n' + err + ' Use `nodecipher --hashes` to see a list of valid HMAC ' +
    'hashes\n'));
}

/**
 * Handles all unknown NodeCipher errors.
 *
 * @param {Object} opts
 * @param {Error} err
 */
function handleUnknownErrors(opts, err) {
  throw err;
}

/**
 * Handle encrypt/decrypt success.
 *
 * @param {Object} opts
 * @param {Error} err
 */
function handleCipherSuccess(opts, err) {
  console.log(chalk.green(
    '\nSuccess: ' + opts.input + ' > ' + opts.output + '\n'
  ));
}

module.exports = cipher;
