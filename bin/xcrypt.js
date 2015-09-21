#!/usr/bin/env node

'use strict';

var nodecipher = require('../');
var defaults = require('../lib/defaults');

module.exports = function (yargs) {

  /**
   * Encrypt/Decrypt command line interface.
   */
  var argv = yargs
    .usage('Usage: $0 ' + process.argv[2] + ' -i input -o output [-p password] [-a algorithm] [--help]')
    .demand(['i','o'])
    .options({
      'i': {
        alias: 'input',
        demand: true,
        describe: 'Relative path to the input file',
        type: 'string'
      },
      'o': {
        alias: 'output',
        demand: true,
        describe: 'Relative path to the output file',
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
        // choices: nodecipher.list(),
        default: defaults.cipher.algorithm
      }
    })
    .alias('h', 'help')
    .help('h')
    .wrap(74)
    .epilogue('For more information, visit http://github.com/nathanbuchar/node-cipher')
    .argv;

  /**
   * Perform the appropriate action based on the command chosen.
   */
  nodecipher[argv._[0]]({
    input: argv.input,
    output: argv.output,
    password: argv.password || undefined,
    algorithm: argv.algorithm
  });
};
