#!/usr/bin/env node

'use strict';

let _ = require('lodash');
let chalk = require('chalk');
let inquirer = require('inquirer');

let nodecipher = require('../');

module.exports = function (yargs) {

  /**
   * Perfom the appropriate encryption or decryption method with the given
   * options. We define this ambiguity as "xcryption".
   *
   * @param {string} method
   * @param {Object} options
   * @param {Function} done
   */
  function performXcryption(method, options, done) {
    nodecipher[method]({
      input: options.input,
      output: options.output,
      algorithm: options.algorithm,
      password: options.password
    }, done);
  }

  /**
   * Prompt for the encryption key if none is provided, then perform the
   * xcryption action.
   *
   * @param {string} method
   * @param {Object} options
   * @param {Function} done
   */
  function xcrypt(method, options, done) {
    if (_.isUndefined(options.password)) {
      inquirer.prompt([{
        type: 'password',
        message: 'Enter the encryption password',
        name: 'password',
        validate(input) {
          return input.length > 0;
        }
      }], function (answers) {
        let password = answers.password;

        xcrypt(method, _.assign({ password }, options), done);
      });
    } else {
      performXcryption(method, options, done);
    }
  }

  let argv = yargs
    .usage('Usage: nodecipher ' + process.argv[2] + ' -i input -o output ' +
      '[-p password] [-a algorithm]')
    .demand(['i', 'o'])
    .options({
      'i': {
        alias: 'input',
        demand: true,
        describe: 'The file to ' + process.argv[2],
        type: 'string'
      },
      'o': {
        alias: 'output',
        demand: true,
        describe: 'The ' + process.argv[2] + 'ed output file',
        type: 'string'
      },
      'p': {
        alias: 'password',
        demand: false,
        describe: 'The encryption password',
        type: 'string'
      },
      'a': {
        alias: 'algorithm',
        demand: false,
        describe: 'The algorithm to use',
        type: 'string',
        default: nodecipher.defaults.algorithm
      }
    })
    .alias('h', 'help')
    .help('h')
    .wrap(74)
    .epilogue('For more information, visit http://git.io/node-cipher')
    .argv;

  if (_.includes(nodecipher.commands, argv._[0])) {
    xcrypt(argv._[0], argv, function (err) {
      if (err) {
        console.log(chalk.red('Error! Invalid cipher algorithm or password.'));
      }
    });
  } else {
    yargs.showHelp();
  }
};
