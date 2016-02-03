/**
 * Nodecipher constants.
 *
 * @module lib/constants
 * @exports {Object}
 * @author Nathan Buchar
 * @since 6.1.0
 */

'use strict';

let crypto = require('crypto');

module.exports = {

  /**
   * @prop {Array} ALL_CIPHERS
   * @description An array of all cipher algorithms.
   * @see {@link https://nodejs.org/api/crypto.html#crypto_crypto_getciphers}
   */
  ALL_CIPHERS: crypto.getCiphers(),

  /**
   * @prop {Array} ALL_HASHES
   * @description An array of all HMAC hashes.
   * @see {@link https://nodejs.org/api/crypto.html#crypto_crypto_gethashes}
   */
  ALL_HASHES: crypto.getHashes()
};
