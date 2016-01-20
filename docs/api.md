Node JS API Guide
=================

**Welcome!**

This is the Node JS API documentation for node-cipher. Below, you'll find instructions on installation, public methods, and the options available to you.


***


Install
-------

```
$ npm install node-cipher
```


Methods
-------

* [`encrypt()`](#encrypt)
* [`encryptSync()`](#encryptsync)
* [`decrypt()`](#decrypt)
* [`decryptSync()`](#decryptsync)
* [`listAlgorithms()`](#listalgorithms)
* [`listHashes()`](#listhashes)

***

### encrypt()

##### `encrypt(options[, callback[, scope]])`

Encrypts a file using the [options](#options) provided. Returns `undefined`.

#### Parameters
|Parameter|Type|Description|Required|
|--------:|:--:|:----------|:------:|
|`options`|`Object`|See [options](#options).|✓|
|`callback`|`Function`|The function to call when the encryption has completed.||
|`scope`|`Object`|The scope for the `callback` function parameter, if provided.||

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
|`scope`|`Object`|The scope for the `callback` function parameter, if provided.||

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

### listAlgorithms()

##### `listAlgorithms():Array`

Lists all available cipher algorithms as an Array. Returns `Array`.

This is shorthand for `require('crypto').getCiphers()`.

#### Example

```js
let nodecipher = require('node-cipher');

console.log(nodecipher.listAlgorithms());
// => ['CAST-cbc', 'aes-128-cbc', ..., 'seed-ofb']
```

***

### listHashes()

##### `listHashes():Array`

Lists all available HMAC hashes as an Array. Returns `Array`.

This is shorthand for `require('crypto').getHashes()`.

#### Example

```js
let nodecipher = require('node-cipher');

console.log(nodecipher.listHashes());
// => ['DSA', DSA-SHA', ..., 'whirlpool']
```


***



Options
-------

|Name|Type|Description|Required|Default|
|:---|:--:|:----------|:------:|:-----:|
|`input`|`string`|The file that you wish to encrypt or decrypt.|✓||
|`output`|`string`|The file that you wish to save the encrypted or decrypted contents to. This file does not necessarily need to exist beforehand.|✓||
|`password`|`string`|The password that we will use to derive the encryption key from.|✓||
|`salt`|`string`|The salt to use when deriving the encryption key.||`"nodecipher"`|
|`iterations`|`number`|The number of iterations to use when deriving the key. The higher the number of iterations, the more secure the derived key will be, but will take a longer amount of time to complete.||`1000`|
|`keylen`|`number`|The desired byte length for the derived key.||`512`|
|`digest`|`string`|The HMAC digest algorithm to use to derive the key. Use [`listHashes()`](#listhashes) to see a list of available HMAC hashes.||`"sha1"`|
|`algorithm`|`string`|The cipher algorithm to use when encrypting or decrypting the input file. Use [`listAlgorithms()`](#listalgorithms) to see a list of available cipher algorithms.||`"cast5-cbc"`|
