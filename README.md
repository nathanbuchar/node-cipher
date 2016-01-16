node-cipher [![Build Status](https://travis-ci.org/nathanbuchar/node-cipher.svg?branch=master)](https://travis-ci.org/nathanbuchar/node-cipher)
===========

Securely encrypt sensitive files for use in public source control. [Find on NPM](https://www.npmjs.com/package/node-cipher).

**Why should I use node-cipher?**

Let's say you have a file in your project name `config.json` which contains sensitive information like private keys and database passwords. What should you do if you need to publicly host a repository containing this file? Certainly you wouldn't want to make the contents of `config.json` visible to the outside world.

You *could* remove the file from source control, and send the file to everyone in your team every time you update the file. But this is pretty cumbersome. Or, you can use node-cipher to encrypt the file and add the encrypted version to source control. This can later be decrypted by each team member independently with a password that you provide. Every time you or one of your team members makes a change to `config.json`, just re-encrypt the file and commit. It's that easy!

Don't forget to add the original `config.json` file to `.gitignore`!


***

**:exclamation: If you're looking for the node-cipher command line tool, it has moved to [node-cipher-cli](http://github.com/nathanbuchar/node-cipher-cli).**

***


Install
-------

```
$ npm install node-cipher
```


Options
-------

|Name|Type|Description|Required|Default|
|:---|:--:|:----------|:------:|:-----:|
|`input`|`string`|The file that you wish to encrypt or decrypt.|✓||
|`output`|`string`|The file that you wish to save the encrypted or decrypted contents to. This file does not necessarily need to exist.|✓||
|`password`|`string`|The key that you will use to encrypt or decrypt your input file. If you are decrypting a file, the password must be the same as the one specified during encryption, or else the decryption will fail.|✓||
|`algorithm`|`string`|The cipher algorithm to use. Use [`list()`](#listarray) to see a list of available cipher algorithms.||`"cast5-cbc"`|


Methods
-------

* [`encrypt()`](#encrypt)
* [`encryptSync()`](#encryptsync)
* [`decrypt()`](#decrypt)
* [`decryptSync()`](#decryptsync)
* [`list()`](#list)

***

### encrypt()

##### `encrypt(options[, callback[, scope]])`

Encrypts a file using the [options](#options) provided. Returns `undefined`.

#### Parameters
|Parameter|Type|Description|Required|
|--------:|:--:|:----------|:------:|
|`options`|`Object`|See [options](#options).|✓|
|`callback`|`Function`|The function to call when the encryption has completed.||
|`scope`|`Object`|The Function scope for the `callback` parameter, if provided.||

#### Example

Encrypts `config.json` into `config.json.cast5` using the password `"passw0rd"`.

```js
let nodecipher = require('node-cipher');

nodecipher.encrypt({
  input: 'config.json',
  output: 'config.json.cast5',
  password: 'passw0rd'
}, function (err) {
  if (err) throw err;

  console.log('config.json encrypted.');
});
```

***

### encryptSync()

##### `encryptSync(options)`

The synchronous version of [`encrypt()`](#encrypt). Returns `undefined`.

#### Parameters
|Parameter|Type|Description|Required|
|--------:|:--:|:----------|:------:|
|`options`|`Object`|See [options](#options).|✓|

#### Example

Synchronously encrypts `config.json` into `config.json.cast5` using the password `"passw0rd"`.

```js
let nodecipher = require('node-cipher');

nodecipher.encryptSync({
  input: 'config.json',
  output: 'config.json.cast5',
  password: 'passw0rd'
});
```

***

### decrypt()

##### `decrypt(options[, callback[, scope]])`

Decrypts a file using the [options](#options) provided. Returns `undefined`.

#### Parameters
|Parameter|Type|Description|Required|
|--------:|:--:|:----------|:------:|
|`options`|`Object`|See [options](#options).|✓|
|`callback`|`Function`|The function to call when the decryption has completed.||
|`scope`|`Object`|The Function scope for the `callback` parameter, if provided.||

#### Example

Decrypts `config.json.cast5` back into `config.json` using the password `"passw0rd"`.

```js
let nodecipher = require('node-cipher');

nodecipher.decrypt({
  input: 'config.json.cast5',
  output: 'config.json',
  password: 'passw0rd'
}, function (err) {
  if (err) throw err;

  console.log('config.json.cast5 decrypted.');
});
```

***

### decryptSync()

##### `decryptSync(options)`

The synchronous version of [`decrypt()`](#decrypt).  Returns `undefined`.

#### Parameters
|Parameter|Type|Description|Required|
|--------:|:--:|:----------|:------:|
|`options`|`Object`|See [options](#options).|✓|

#### Example

Synchronously decrypts `config.json.cast5` back into `config.json` using the password `"passw0rd"`.

```js
let nodecipher = require('node-cipher');

nodecipher.decryptSync({
  input: 'config.json.cast5',
  output: 'config.json',
  password: 'passw0rd'
});
```

***

### list()

##### `list():Array`

Lists all available cipher algorithms as an Array. Returns `Array`.

#### Example

```js
let nodecipher = require('node-cipher');

console.log(nodecipher.list());
// => ['CAST-cbc', 'aes-128-cbc', ..., 'seed-ofb']
```


***


Debug
-----

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
