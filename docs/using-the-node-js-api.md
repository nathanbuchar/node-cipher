Using the Node JS API
=====================

[Click here][root] to return to the README.




Contents
--------

* [Introduction][section_introduction]
* [Installation][section_installation]
* [Public Methods][section_methods]
  * [`encrypt()`][method_encrypt]
  * [`encryptSync()`][method_encrypt-sync]
  * [`decrypt()`][method_decrypt]
  * [`decryptSync()`][method_decrypt-sync]
  * [`listAlgorithms()`][method_list-algorithms]
  * [`listHashes()`][method_list-hashes]
* [Options][section_options]
* [Examples][section_examples]



***



Introduction
------------

**Welcome!** This section details the Node JS API documentation for node-cipher. Here, you'll find instructions on installation, public methods, options available to you, and several practical examples.




Installation
------------

To install node-cipher, simply run the following

    $ npm install node-cipher

This will install the node-cipher package into your project's `node_modules` directory.




Public Methods
--------------

There are several public methods available via the Node JS API: [`encrypt`][method_encrypt], [`encryptSync`][method_encrypt-sync], [`decrypt`][method_decrypt], [`decryptSync`][method_decrypt-sync], [`listAlgorithms`][method_list-algorithms], and [`listHashes`][method_list-hashes]. Each of these are detailed below.



### encrypt()

**`encrypt(options[, callback[, scope]])`**

This method asynchronously encrypts the chosen input file using the [options][section_options] provided, and then saves the encrypted content to the chosen output file.


#### Parameters
|Parameter|Type|Description|Required|
|--------:|:--:|:----------|:------:|
|`options`|`Object`|The options object. See [options][section_options].|✓|
|`callback`|`Function`|The function to call when the encryption has completed.||
|`scope`|`Object`|The scope for the `callback` function parameter, if provided.||

#### Example
The following example demonstrates encrypting the contents of `config.json` using `passw0rd` as the password, then saving the encrypted contents to a file named `config.json.cast5`.

```js
let nodecipher = require('node-cipher');

nodecipher.encrypt({
  input: 'config.json',
  output: 'config.json.cast5',
  password: 'passw0rd'
}, function (err) {
  if (err) throw err;

  console.log('It worked!');
});
```



### encryptSync()

**`encryptSync(options)`**

This is the synchronous version of [`encrypt()`][method_encrypt]. This method does not accept the `callback` and `scope` parameters, as they are not necessary for synchronous code.

#### Parameters
|Parameter|Type|Description|Required|
|--------:|:--:|:----------|:------:|
|`options`|`Object`|The options object. See [options][section_options].|✓|

#### Example
The following example demonstrates synchronously encrypting the contents of `config.json` using `passw0rd` as the password, then saving the encrypted contents to a file named `config.json.cast5`.

```js
let nodecipher = require('node-cipher');

nodecipher.encryptSync({
  input: 'config.json',
  output: 'config.json.cast5',
  password: 'passw0rd'
});
```



### decrypt()

**`decrypt(options[, callback[, scope]])`**

This method asynchronously decrypts the chosen input file using the [options][section_options] provided, and then saves the decrypted content to the chosen output file.

#### Parameters
|Parameter|Type|Description|Required|
|--------:|:--:|:----------|:------:|
|`options`|`Object`|The options object. See [options][section_options].|✓|
|`callback`|`Function`|The function to call when the decryption has completed.||
|`scope`|`Object`|The scope for the `callback` function parameter, if provided.||

#### Example
The following example demonstrates decrypting the contents of `config.json.cast5` using `passw0rd` as the password, then saving the decrypted contents back to a file named `config.json`.

```js
let nodecipher = require('node-cipher');

nodecipher.decrypt({
  input: 'config.json.cast5',
  output: 'config.json',
  password: 'passw0rd'
}, function (err) {
  if (err) throw err;

  console.log('It worked!');
});
```



### decryptSync()

**`decryptSync(options)`**

This is the synchronous version of [`decrypt()`][method_decrypt]. This method does not accept the `callback` and `scope` parameters, as they are not necessary for synchronous code.

#### Parameters
|Parameter|Type|Description|Required|
|--------:|:--:|:----------|:------:|
|`options`|`Object`|The options object. See [options][section_options].|✓|

#### Example
The following example demonstrates synchronously decrypting the contents of `config.json.cast5` using `passw0rd` as the password, then saving the decrypted contents back to a file named `config.json`.

```js
let nodecipher = require('node-cipher');

nodecipher.decryptSync({
  input: 'config.json.cast5',
  output: 'config.json',
  password: 'passw0rd'
});
```



### listAlgorithms()

**`listAlgorithms():Array`**

Returns an array with the names of the supported cipher algorithms for use by the `algorithm` option. This is shorthand for [`crypto.getCiphers()`][external_crypto_getCiphers]. Returns `Array`.

#### Example
```js
let nodecipher = require('node-cipher');

let algorithms = nodecipher.listAlgorithms();

console.log(algorithms); // ['aes-128-cbc', 'aes-128-ccm', ...]
```



### listHashes()

**`listHashes():Array`**

Returns an array with the names of the supported hash algorithms for use by the `digest` option. This is shorthand for [`crypto.getHashes()`][external_crypto_getHashes]. Returns `Array`.

#### Example
```js
let nodecipher = require('node-cipher');

let hashes = nodecipher.listHashes();

console.log(hashes); // ['sha', 'sha1', 'sha1WithRSAEncryption', ...]
```



***



Options
-------

|Name|Type|Description|Required|Default|
|:---|:--:|:----------|:------:|:-----:|
|`input`|`string`|The file that you wish to encrypt or decrypt.|✓||
|`output`|`string`|The file that you wish to save the encrypted or decrypted contents to. This file does not necessarily need to exist beforehand.|✓||
|`password`|`string`|The password used to derive the encryption key.|✓||
|`algorithm`|`string`|The algorithm used in tandem with the derived key to create the cipher function that will be used to encrypt or decrypt the input file. Use [`listAlgorithms()`][method_list-algorithms] to see a list of available cipher algorithms.||`"cast5-cbc"`|
|`salt`|`string`|The salt used to derive the encryption key. This should be as unique as possible. It is recommended that salts are random and their lengths are greater than 16 bytes.||`"nodecipher"`|
|`iterations`|`number`|The number of iterations used to derive the key. The higher the number of iterations, the more secure the derived key will be, but will take a longer amount of time to complete.||`1000`|
|`keylen`|`number`|The desired byte length for the derived key.||`512`|
|`digest`|`string`|The HMAC digest algorithm used to derive the key. Use [`listHashes()`][method_list-hashes] to see a list of available HMAC hashes.||`"sha1"`|



***



Examples
--------

1. Encrypts the contents of `config.json` using `passw0rd` as the password, then saves the decrypted contents to a file named `config.json.cast5`.

    ```js
    let nodecipher = require('node-cipher');

    nodecipher.encrypt({
      input: 'config.json',
      output: 'config.json.cast5',
      password: 'passw0rd'
    }, function (err) {
      if (err) throw err;

      console.log('It worked!');
    });
    ```

2. Encrypts the contents of `config.json` using `passw0rd` as the password and a custom salt, then saves the decrypted contents to a file named `config.json.cast5`.

    ```js
    let nodecipher = require('node-cipher');

    nodecipher.encrypt({
      input: 'config.json',
      output: 'config.json.cast5',
      password: 'passw0rd',
      salt: 'alakazam'
    }, function (err) {
      if (err) throw err;

      console.log('It worked!');
    });
    ```

3. Encrypts the contents of `config.json` using `passw0rd` as the password and a custom salt, algorithm, digest, and byte length, then saves the decrypted contents to a file named `config.json.aes-128`.

    ```js
    let nodecipher = require('node-cipher');

    nodecipher.encrypt({
      input: 'config.json',
      output: 'config.json.aes-128',
      password: 'passw0rd',
      algorithm: 'aes-128-cbc'
      salt: 'alakazam',
      keylen: 1024,
      digest: 'sha512'
    }, function (err) {
      if (err) throw err;

      console.log('It worked!');
    });
    ```

4. Synchronously decrypts the contents of `config.json.cast5` using `passw0rd` as the password and custom iterations, then saves the decrypted contents back to a file named `config.json`.

    ```js
    let nodecipher = require('node-cipher');

    nodecipher.decryptsync({
      input: 'config.json.cast5',
      output: 'config.json',
      password: 'passw0rd',
      iterations: 100000
    });
    ```








[root]: ../../

[section_introduction]: #introduction
[section_installation]: #installation
[section_options]: #options
[section_methods]: #public-methods
[section_examples]: #examples

[method_encrypt]: #encrypt
[method_encrypt-sync]: #encryptsync
[method_decrypt]: #decrypt
[method_decrypt-sync]: #decryptsync
[method_list-algorithms]: #listalgorithms
[method_list-hashes]: #listhashes

[external_crypto_getCiphers]: https://nodejs.org/api/crypto.html#crypto_crypto_getciphers
[external_crypto_getHashes]: https://nodejs.org/api/crypto.html#crypto_crypto_gethashes
