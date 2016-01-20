node-cipher [![Build Status](https://travis-ci.org/nathanbuchar/node-cipher.svg?branch=master)](https://travis-ci.org/nathanbuchar/node-cipher)
===========

Securely encrypt sensitive files for use in public source control. [Find on NPM][external_package_node-cipher].




#### What is node-cipher?

Node-cipher is both a command line tool and a Node JS API which allows you to easily encrypt or decrypt files containing sensitive information. In doing so, you can safely add encrypted files to a public repository, even if they contain sensitive API keys and passwords.




#### Why use node-cipher?

Let's say you have a file in your project name `config.json` which contains sensitive information like private keys and database passwords. What should you do if you need to publicly host a repository containing this file? Certainly you wouldn't want to make the contents of `config.json` visible to the outside world.

You *could* remove the file from source control and send the file to everyone in your team every time you update the file, but this approach is very cumbersome. Instead, you can use node-cipher to encrypt the file and add the encrypted version to source control. This can later be decrypted by each team member independently with a password that you provide. Every time you or one of your team members makes a change to `config.json`, just re-encrypt the file and commit. It's that easy!

Don't forget to add the original `config.json` file to `.gitignore`!




#### How it Works

You might be curious as to how node-cipher encrypts files and how securely the contents of these encrypted files are. There is a two-step process, wherein an encryption key is first derived from the given password and additional options (`pbkdf2`). Then, this key is used in tandem with the cipher algorithm to create a custom cipher method (`createCipher`) which is used to encrypt the contents of the chosen file. These two processes are outlined in more detail below.

1. **Password-based key derivation**

    To derive the encryption key, node-cipher implements password-based key derivation via the [`crypto.pbkdf2()`][external_crypto_pbkdf2] function. The chosen HMAC digest algorithm (`digest`) is used to derive a key of the requested byte length (`keylen`) from the given password, salt, and iterations.

    It should be noted however that the salt, iterations, byte length, and digest hash all have default values set within the node-cipher source code, so it is recommended that for added security these be customized by the end user and kept secret (this is sometimes referred to as a "pepper").

2. **Cipher algorithm generation**

    Once the key has been obtained, node-cipher then creates a custom cipher function using the derived key and the chosen cipher algorithm (`algorithm`) via the [`crypto.createCipher()`][external_crypto_create-cipher] function. The contents of the given input file are then read and piped through this cipher function before being streamed into the desired output file.



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

The documentation is rather extensive and thereby is split into two pieces.


1. **Using the Command Line Interface**

  [Click here][docs_cli] for documentation on how to use node-cipher in the command line.

2. **Using the Node JS API**

  [Click here][docs_api] for documentation on how to use node-cipher within Node JS (v4+).



***



Debugging
---------

Node-cipher implements [debug][external_package_debug] for development logging. To configure node-cipher with debug, set the `DEBUG` environment to `nodecipher:*` by performing the following:

**Mac OS:**
```bash
$ export DEBUG=nodecipher:*
```

**Windows:**
```bash
$ set DEBUG=nodecipher:*
```



***



Authors
-------
* [Nathan Buchar][contact_nathan]


License
-------
MIT








[section_what]: #what-is-node-cipher
[section_why]: #why-use-node-cipher
[section_how]: #how-it-works
[section_installation]: #installation
[section_documentation]: #documentation
[section_debugging]: #debugging
[section_authors]: #authors
[section_license]: #license

[docs_cli]: ./docs/using-the-command-line-interface.md
[docs_api]: ./docs/using-the-node-js-api.md

[external_package_node-cipher]: https://npmjs.com/package/node-cipher
[external_package_debug]: https://npmjs.com/package/debug

[external_crypto_create-cipher]: https://nodejs.org/api/crypto.html#crypto_crypto_createcipher_algorithm_password
[external_crypto_pbkdf2]: https://nodejs.org/api/crypto.html#crypto_crypto_pbkdf2_password_salt_iterations_keylen_digest_callback

[contact_nathan]: mailto:hello@nathanbuchar.com
