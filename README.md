node-cipher [![Build Status](https://travis-ci.org/nathanbuchar/node-cipher.svg?branch=master)](https://travis-ci.org/nathanbuchar/node-cipher)
===========

Securely encrypt sensitive files for use in public source control. [Find on NPM](https://www.npmjs.com/package/node-cipher).


**What is node-cipher?**

Node-cipher is both a command line tool and a Node JS package which allows you to easily encrypt or decrypt files containing sensitive information. This way, you can safely add encrypted files to a public repository, even if they contain API keys and passwords.


**Why would I use node-cipher?**

Let's say you have a file in your project name `config.json` which contains sensitive information like private keys and database passwords. What should you do if you need to publicly host a repository containing this file? Certainly you wouldn't want to make the contents of `config.json` visible to the outside world.

You *could* remove the file from source control and send the file to everyone in your team every time you update the file, but this approach is very cumbersome. Instead, you can use node-cipher to encrypt the file and add the encrypted version to source control. This can later be decrypted by each team member independently with a password that you provide. Every time you or one of your team members makes a change to `config.json`, just re-encrypt the file and commit. It's that easy!

Don't forget to add the original `config.json` file to `.gitignore`!

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

The documentation is pretty extensive, and it's split into two pieces.

**How to use the Command Line Interface**
[Documentation](https://github.com/nathanbuchar/node-cipher/blob/master/docs/cli.md)

**Using the Node JS API**
[Documentation](https://github.com/nathanbuchar/node-cipher/blob/master/docs/api.md)


***


Debugging
---------

Node-cipher implements [debug](https://github.com/visionmedia/debug) for development logging. To set up node-cipher with debug, set the following environment variables:

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
* [Nathan Buchar](mailto:hello@nathanbuchar.com)


License
-------
MIT
