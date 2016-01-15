#!/usr/bin/env node

'use strict';

let _ = require('lodash');
let yargs = require('yargs');

let nodecipher = require('../');
let xcrypt = require('./xcrypt');

/**
 * Base command line interface.
 */
let argv = yargs
  .version(function () {
    return require('../package').version;
  })
  .usage('Usage: nodecipher [--list] [--version] [--help] <command> <args>')
  .command('encrypt', 'Encrypt a given file', xcrypt)
  .command('decrypt', 'Decrypt a given file', xcrypt)
  .options({
    'l': {
      alias: 'list',
      describe: 'List all available cipher algorithms',
      type: 'boolean'
    }
  })
  .alias('v', 'version')
  .alias('h', 'help')
  .help('h')
  .wrap(74)
  .epilogue('For more information, visit http://git.io/node-cipher')
  .argv;

/**
 * Show help menu if `list` is not chosen and the specified command is invalid.
 */
if (argv.list) {
  console.log(nodecipher.list().join(', '));
} else if (!_.includes(nodecipher.commands, argv._[0])) {
  yargs.showHelp();
}
