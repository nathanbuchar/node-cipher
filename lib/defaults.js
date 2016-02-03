/**
 * Nodecipher defaults.
 *
 * @module lib/defaults
 * @exports {Object}
 * @author Nathan Buchar
 * @since 6.1.0
 */

'use strict';

module.exports = {

  /**
   * @prop {string} INPUT
   * @description The file that you wish to encrypt or decrypt.
   */
  INPUT: undefined,

  /**
   * @prop {string} OUTPUT
   * @description The file that you wish to save the encrypted or decrypted
   *   contents to. This file does not necessarily need to exist beforehand.
   */
  OUTPUT: undefined,

  /**
   * @prop {string} PASSWORD
   * @description The password used to derive the encryption key.
   */
  PASSWORD: undefined,

  /**
   * @prop {string} ALGORITHM
   * @description A cipher algorithm used in tandem with the derived key to
   *   create the cipher function that will be used to encrypt or decrypt the
   *   chosen input file. You may use `listAlgorithms()` to see a list of
   *   available cipher algorithms.
   */
  ALGORITHM: 'cast5-cbc',

  /**
   * @prop {string|Buffer} SALT
   * @description A string or buffer used in tandem with the password, byte
   *   length, digest, and iterations to derive the encryption key. This should
   *   be as unique as possible and it's recommended that salts are random and
   *   their lengths are greater than 16 bytes.
   */
  SALT: 'nodecipher',

  /**
   * @prop {number} ITERATIONS
   * @description An integer representing the number of iterations used to
   *   derive the key. This is used in tandem with the password, salt, byte
   *   length, and digest to derive the encryption key. The higher the number of
   *   iterations, the more secure the derived key will be, but the longer it
   *   will take to complete.
   */
  ITERATIONS: 1000,

  /**
   * @prop {number} KEYLEN
   * @description An integer representing the desired byte length for the
   *   derived key. This is used in tandem with the password, salt, digest, and
   *   iterations to derive the encryption key.
   */
  KEYLEN: 512,

  /**
   * @prop {string} DIGEST
   * @description An HMAC digest algorithm that will be used in tandem with the
   *   password, salt, byten length, and iterations to derive the key. You may
   *   use `listHashes()` to see a list of available HMAC hashes.
   */
  DIGEST: 'sha1'
};
