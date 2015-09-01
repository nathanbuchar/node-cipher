#!/usr/bin/env node

var yargs = require('yargs');

var nodecipher = require('../');
var defaults = require('../lib/defaults');

/**
 * Command line interface.
 */
var argv = yargs
  .reset()
  .usage('Usage: $0 ' + process.argv[2] + ' -i [string] -o [string]')
  .demand(['i','o'])
  .option('i', {
    alias: 'input',
    demand: true,
    describe: 'The relative path to the input file',
    type: 'string'
  })
  .option('o', {
    alias: 'output',
    demand: true,
    describe: 'The relative path to the output file',
    type: 'string'
  })
  .option('p', {
    alias: 'password',
    demand: false,
    describe: 'The encryption password',
    type: 'string'
  })
  .option('a', {
    alias: 'algorithm',
    demand: false,
    default: defaults.cipher.algorithm,
    describe: 'The algorithm to use',
    type: 'string'
  })
  .help('h')
  .argv;

/**
 * The chosen command.
 */
var command = argv._[0];

/**
 * Perform the appropriate action based on the command chosen.
 */
nodecipher[command]({
  input: argv.input,
  output: argv.output,
  password: argv.password || undefined,
  algorithm: argv.algorithm
});
