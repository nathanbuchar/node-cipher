#!/usr/bin/env node

'use strict';

let _ = require('lodash');
let program = require('commander');

let Package = require('../package.json');
let cipher = require('./actions/cipher');

let nodecipher = require('../');

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
     * This is the password that will be used to derive the encryption key from.
     * If the password is not provided, the user will be asked to provide one,
     * as it is required.
     */
    .option(
      '-p, --password <value>',
      'the password that we will derive a key from'
    )

    /**
     * Define option: -s, --salt <value>
     *
     * This is the salt that will be used to derive the key. By default, this is
     * "nodecipher", however the user may choose to customize this on their own
     * for greater security.
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
     * This is the number of iterations with which to derive the encryption key.
     * The higher the number, the more secure, but the longer it will take to
     * process.
     *
     * @default 1000
     */
    .option(
      '-i, --iterations [n]',
      'the number of iterations with which to derive the key',
      parseInt
    )

    /**
     * Define option: -l, --keylen <n>
     *
     * This is the desired byte length for the derived encryption key.
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
     * This is the HMAC digest algorithm to use to derive the key, combined with
     * all the other options.
     *
     * @default "sha1"
     */
    .option(
      '-d, --digest [value]',
      'the HMAC digest algorithm to use to derive the key'
    )

    /**
     * Define option: -a, --algorithm <value>
     *
     * This is the algorithm to use to encrypt the file with the encryption key.
     *
     * @default "cast5-cbc"
     */
    .option(
      '-a, --algorithm [value]',
      'the algorithm to use to encrypt the file'
    )

    /**
     * Define command action.
     */
    .action((input, output, options) => {
      cipher(command, input, output, options);
    });
});

/**
 * Process the provided arguments.
 */
program.parse(process.argv);

/**
 * Handle list algorithms.
 */
if (program.algorithms) {
  console.log(nodecipher.listAlgorithms().join('\n'));
}

/**
 * Handle list hashes.
 */
if (program.hashes) {
  console.log(nodecipher.listHashes().join('\n'));
}

/**
 * Handle no input (show help).
 */
if (!process.argv.slice(2).length) {
  program.outputHelp();
}
