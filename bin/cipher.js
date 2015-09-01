#!/usr/bin/env node

var yargs = require('yargs');

var nodecipher = require('../');

/**
 * Command line interface.
 */
var argv = yargs
  .usage('Usage: $0 <command>')
  .command('encrypt', 'Encrypt a given input file')
  .command('decrypt', 'Decrypt a given input file')
  .command('list', 'List all available cipher options')
  .demand(1, 'Please provide a valid command')
  .argv;

/**
 * The chosen command.
 */
var command = argv._[0];

/**
 * Perform the appropriate action based on the command chosen.
 */
switch (command) {
  case 'encrypt':
  case 'decrypt':
    require('./xcrypt');
    break;
  case 'list':
    console.log(nodecipher.list().join(', '));
    break;
  default:
    console.log('No command specified');
    yargs.showHelp();
}
