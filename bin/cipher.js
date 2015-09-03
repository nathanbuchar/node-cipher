#!/usr/bin/env node

'use strict';

var yargs = require('yargs');

var nodecipher = require('../');
var xcrypt = require('./xcrypt');

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
  .option('l', {
    alias: 'list',
    describe: 'List all available cipher algorithms',
    type: 'boolean'
  })
  .alias('v', 'version')
  .alias('h', 'help')
  .help('h')
  .wrap(74)
  .epilogue('For more information, visit http://github.com/nathanbuchar/node-cipher')
  .argv;

/**
 * Show help menu if `list` is not chosen and the specified command is invalid.
 */
if (argv.list) {
  var algorithmArray = nodecipher.list();
  var algorithmList = algorithmArray.join(', ');

  console.log(algorithmList);
} else if (['encrypt', 'decrypt'].indexOf(argv._[0]) < 0) {
  yargs.showHelp();
}
