#!/usr/bin/env node

'use strict';

let _ = require('lodash');
let program = require('commander');

let Package = require('../package.json');
let cipher = require('./actions/cipher');
let chalk = require('chalk');

let nodecipher = require('../');

/**
 * Issues the password security warning, if relevant.
 *
 * @param {string} password
 */
function issuePasswordSecurityWarning(password) {
  if (!_.isUndefined(password)) {
    console.log(chalk.yellow(
      '\nFor security reasons, the password should not be defined as ' +
      'part of the command. In the future, you should omit the ' +
      '`--password` option and node-cipher will prompt you for it ' +
      'separately. This is more secure, as it will not expose the ' +
      'password within your command history :).'
    ));
  }
}

/**
 * Define CLI basics.
 */
program
  .version(Package.version)
  .usage('<encrypt|decrypt> <input> <output> [options]');

/**
 * Define option: -A, --algorithms
 *
 * This will output a list of all available cipher algorithms for use in the
 * algorithm option.
 */
program.option(
  '-A, --algorithms',
  'output a list of all available cipher algorithms'
);

/**
 * Define option: -H, --hashes
 *
 * This will output a list of all available HMAC hashes for use in the digest
 * option.
 */
program.option(
  '-H, --hashes',
  'output a list of all available HMAC hashes'
);

/**
 * Define encrypt and decrypt commands.
 */
_.each(['encrypt', 'decrypt'], command => {
  program

    /**
     * Define command schema.
     */
    .command(`${command} <input> <output>`)

    /**
     * Define command decription.
     */
    .description(command + 's the input file using the options provided')

    /**
     * Define command alias.
     *
     * encrypt => enc
     * decrypt => dec
     */
    .alias(command.substr(0, 3))

    /**
     * Define option: -p, --password <value>
     *
     * This is the password that will be used to derive the encryption key. If
     * the password is not provided, the user will be asked to provide one, as
     * it is required.
     *
     * NOTE: For security reasons, it is recommended that you do not define the
     * password as part of the command. Omit the `--password` option and
     * `node-cipher` will prompt you for it separately via inquirer. This way,
     * the password is not exposed as part of your command history.
     */
    .option(
      '-p, --password [value]',
      'the password that we will derive a key from'
    )

    /**
     * Define option: -a, --algorithm <value>
     *
     * This is the algorithm that will be used in tandem with the derived key to
     * create the cipher function that will be used to encrypt or decrypt the
     * input file.
     *
     * @default "cast5-cbc"
     */
    .option(
      '-a, --algorithm [value]',
      'the algorithm used to ceeate the cipher'
    )

    /**
     * Define option: -s, --salt <value>
     *
     * This is the salt that will be used to derive the key. By default, this is
     * "nodecipher", however the user may choose to customize this on their own
     * for greater security. This should be as unique as possible. It is
     * recommended that salts are random and their lengths are greater than 16
     * bytes.
     *
     * @default "nodecipher"
     */
    .option(
      '-s, --salt [value]',
      'the salt used to derive the key'
    )

    /**
     * Define option: -i, --iterations <n>
     *
     * This is the number of iterations used to derive the encryption key. The
     * higher the number, the more secure, but the longer it will take to
     * process.
     *
     * @default 1000
     */
    .option(
      '-i, --iterations [n]',
      'the number of iterations used derive the key',
      parseInt
    )

    /**
     * Define option: -l, --keylen <n>
     *
     * This is the desired byte length for the derived key.
     *
     * @default 512
     */
    .option(
      '-l, --keylen [n]',
      'the desired byte length for the derived key',
      parseInt
    )

    /**
     * Define option: -d, --digest <value>
     *
     * This is the HMAC hash that is used to derive the key from the salt,
     * iterations, key length, and password.
     *
     * @default "sha1"
     */
    .option(
      '-d, --digest [value]',
      'the hash used to derive the key'
    )

    /**
     * Define command action.
     */
    .action((input, output, options) => {
      issuePasswordSecurityWarning(options.password);
      cipher(command, input, output, options);
    });
});

/**
 * Process the provided arguments.
 */
program.parse(process.argv);

/**
 * Handle list algorithms and end processing.
 */
if (program.algorithms) {
  console.log(nodecipher.listAlgorithms().join('\n'));
  return;
}

/**
 * Handle list hashes and end processing.
 */
if (program.hashes) {
  console.log(nodecipher.listHashes().join('\n'));
  return;
}

/**
 * Handle no input (show help) and end processing.
 */
if (!process.argv.slice(2).length) {
  program.outputHelp();
  return;
}
