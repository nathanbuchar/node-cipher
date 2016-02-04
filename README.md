node-cipher [![Build Status](https://travis-ci.org/nathanbuchar/node-cipher.svg?branch=master)](https://travis-ci.org/nathanbuchar/node-cipher)
===========

Securely encrypt sensitive files for use in public source control. [Find on NPM][external_package_node-cipher].



***



What is it?
-----------

`node-cipher` is both a command line tool and a Node JS API which allows you to easily encrypt or decrypt files containing sensitive information. In doing so, you can safely add encrypted files to a public repository, even if they contain sensitive API keys and passwords. **Requires Node 4 or above.**




Why use it?
-----------

As an individual, you may desire to publicly share a personal repository on GitHub or BitBucket, but some config files or exposed environment variables within your project may contain sensitive information like API keys and passwords. Instead of removing this file from source control entirely, you could instead scramble the contents of the file using `node-cipher` and commit the encrypted file. This way, you need only decrypt the file when you clone the repository, instead of having to re-write the file from scratch if you need to make a clone and don't have the original file.

This is also applicable in a team setting; Even if a repository is private, enhanced security for sensitive information may still be desired. Simply disclose the encryption information with your team members once, and they can decrypt the necessary files when they clone the repository or in the future if the files are modified. If any changes are made to these files, simply re-encrypt and commit the changes. Without `node-cipher`, any time a modification is made, all team members would need to be notified of the change so that they could make the appropriate adjustments.

Just remember to add the unencrypted file to `.gitignore`!




How does it work?
-----------------

There is a two-step process, wherein an encryption key is first derived from the given password and options. This key is then used in tandem with the cipher algorithm to create a custom cipher method which is used to encrypt the contents of the chosen file. These encrypted contents are then saved to the desired output file. These two processes are outlined in more detail below.

1. **Password-based key derivation**

  To derive the encryption key, `node-cipher` implements password-based key derivation via the [`crypto.pbkdf2`][external_crypto_pbkdf2] function. The chosen HMAC digest algorithm (`digest`, `-d`) is used to derive a key of the requested byte length (`keylen`, `-l`) from the given password (`password`, `-p`), salt (`salt`, `-s`), and iterations (`iterations`, `-i`).

  It should be noted however that the salt, iterations, byte length, and digest hash all have default values set within the `node-cipher` source code, so it is recommended that for added security these be customized by the end user and kept secret (this is sometimes referred to as a "pepper"). For basic usage, you really only need to set the password.
2. **Cipher object generation**

  Once the key has been obtained, `node-cipher` then creates a custom Cipher object using the derived key and the chosen algorithm (`algorithm`, `-a`) via the [`crypto.createCipher`][external_crypto_create-cipher] function. In doing so, the cipher key and initialization vector (IV) for the Cipher instance are derived via the OpenSSL function [`EVP_BytesToKey`][external_link_sslbytestokey] and are used to encrypt the contents of the given input file. To do this, the contents of the input file are read and piped through this Cipher object which scrambles the contents before streaming them into the desired output file.



***



Installation
------------

**Command Line Interface**
```
$ npm install -g node-cipher
```

**Node JS**
```
$ npm install node-cipher
```



***



Documentation
-------------

The `node-cipher` documentation is rather extensive and is therefore split into two sections.


1. **[Using the Command Line Interface][docs_cli]**

    Documentation on how to use `node-cipher` in the command line.
2. **[Using the Node JS API][docs_api]**

    Documentation on how to use `node-cipher` within Node JS.



***



Terminology
-----------

* **Password**

  A string that the final encryption key is derived from. This should be as secure as possible.


* **Algorithm**

  A cipher algorithm used in tandem with the derived key to create the cipher function that will be used to encrypt or decrypt the chosen input file. You may use `$ nodecipher --alogrithms` to see a list of available cipher algorithms. Default `cast5-cbc`


* **Salt**

  A string or buffer used in tandem with the password, byte length, digest, and iterations to derive the encryption key. This should be as unique as possible and it's recommended that salts are random and their lengths are greater than 16 bytes. Default `nodecipher`


* **Iterations**

  An integer representing the number of iterations used to derive the key. This is used in tandem with the password, salt, byte length, and digest to derive the encryption key. The higher the number of iterations, the more secure the derived key will be, but the longer it will take to complete. Default `1000`


* **Byte Length**

  An integer representing the desired byte length for the derived key. This is used in tandem with the password, salt, digest, and iterations to derive the encryption key. Default `512`


* **Digest**

  An HMAC digest algorithm that will be used in tandem with the password, salt, byten length, and iterations to derive the key. You may use `$ nodecipher --hashes` to see a list of available HMAC hashes. Default `sha1`



***



Using RC
--------

`node-cipher` v6.2.0 and later implements the configuration loader [rc][external_package_rc] to help you define global encryption options for your project. Simply name the file `.nodecipherrc` and populate with any of the `node-cipher` options defined in the [Node JS API](./docs/using-the-node-js-api.md#options). These options will extend the `node-cipher` defaults and will be applied any time you encrypt or decrypt a file. They can be overridden if you pass in these options directly via the command line or by using the Node JS API.

**Example**
```json
{
  "password": "buffer-zillion-mailman",
  "salt": "kEPbGpTbuYbk3sb2sQKGqm",
  "iterations": 100000,
  "algorithm": "aes-128-cbc"
}
```



***



Debugging
---------

`node-cipher` implements [debug][external_package_debug] for development logging. To configure `node-cipher` with debug, set the `DEBUG` environment to `nodecipher:*` by entering the following into the command line:

**Mac OS:**
```bash
$ export DEBUG=nodecipher:*
```

**Windows:**
```bash
$ set DEBUG=nodecipher:*
```



***



Disclaimer
----------
Nothing is ever completely secure. `node-cipher` provides you with the tools to create a strongly-encrypted file, but that does not mean it's uncrackable. As stated in the MIT license, I, and any subsequent authors or copyright holders of this software, are not liable for any damages that arise from or in connection to this software. [Click here][license] to read the license in its entirety.



***



Authors
-------
* [Nathan Buchar]


License
-------
MIT








[section_what]: #what-is-it
[section_why]: #why-use-it
[section_how]: #how-does-it-work
[section_terms]: #terminology
[section_installation]: #installation
[section_documentation]: #documentation
[section_debugging]: #debugging
[section_disclaimer]: #disclaimer
[section_authors]: #authors
[section_license]: #license

[docs_cli]: ./docs/using-the-command-line-interface.md
[docs_api]: ./docs/using-the-node-js-api.md

[license]: ./LICENSE.md

[external_package_node-cipher]: https://npmjs.com/package/node-cipher
[external_package_debug]: https://npmjs.com/package/debug
[external_package_rc]: https://www.npmjs.com/package/rc

[external_crypto_create-cipher]: https://nodejs.org/api/crypto.html#crypto_crypto_createcipher_algorithm_password
[external_crypto_pbkdf2]: https://nodejs.org/api/crypto.html#crypto_crypto_pbkdf2_password_salt_iterations_keylen_digest_callback

[external_link_sslbytestokey]: https://www.openssl.org/docs/manmaster/crypto/EVP_BytesToKey.html

[Nathan Buchar]: mailto:hello@nathanbuchar.com
