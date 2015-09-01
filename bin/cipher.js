#!/usr/bin/env node

var yargs = require('yargs');

var nodecipher = require('../');
var xcrypt = require('./xcrypt');
var list = require('./list');

/**
 * List valid commands.
 */
var commands = [
  'encrypt',
  'decrypt',
  'list'
];

/**
 * Base command line interface.
 */
var argv = yargs
  .version(function () {
    return require('../package').version;
  })
  .usage('Usage: $0 <command>')
  .command('encrypt', 'Encrypt a given file', xcrypt)
  .command('decrypt', 'Decrypt a given file', xcrypt)
  .command('list', 'List all available cipher algorithms', list)
  .epilogue('For more information, visit http://github.com/nathanbuchar/node-cipher')
  .alias('h', 'help')
  .alias('v', 'version')
  .help('h')
  .wrap(74)
  .argv;

/**
 * Show help if the chosen command is invalid.
 */
if (commands.indexOf(argv._[0]) < 0) {
  yargs.showHelp();
}
