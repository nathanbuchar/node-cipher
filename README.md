node-cipher
===========

Securely encrypt sensitive files for use in public source control. [Find on NPM](https://www.npmjs.com/package/node-cipher).

Looking for the command line tool? [Click here](http://github.com/nathanbuchar/node-cipher-cli).


**Why would I want to encrypt my files?**

Let's say you have a file in your project name `config.json` which contains sensitive information like private keys and database passwords.

What happens if you want to publicly host a repository containing this file? Certainly you wouldn't want to make the contents of `config.json` visible to the outside world, so instead you can use **node-cipher** to encrypt the file and add its encrypted counterpart to source control, which can later be decrypted using the encryption key when the repository is cloned.

Just don't forget to add the original `config.json` file to `.gitignore`!


***


Install
-------

```
$ npm install node-cipher
```


***


Options
-------

|Name|Type|Description|Required|Default|
|:---|:--:|:----------|:------:|:-----:|
|`input`|`string`|The input filename relative to the current working directory.|✓||
|`output`|`string`|The output filename relative to the current working directory.|✓||
|`password`|`string`|The encryption password. Unlike the command line interface, this MUST be specified.|✓||
|`algorithm`|`string`|The algorithm to use. Use [`list()`](#listarray) to see a list of available cipher algorithms.||`"cast5-cbc"`|


Methods
-------

* [`encrypt()`](#encryptoptions-callback-scope)
* [`encryptSync()`](#encryptsyncoptions-callback-scope)
* [`decrypt()`](#decryptoptions-callback-scope)
* [`decryptSync()`](#decryptsyncoptions-callback-scope)
* [`list()`](#listarray)

***

### `encrypt(options[, callback[, scope]])`

Encrypts a file using the [options](#options) provided.

#### Parameters
|Parameter|Type|Description|Required|Default|
|--------:|:--:|:----------|:------:|:-----:|
|`options`|`Object`|See [options](#options).|✓||
|`callback`|`Function`|The function to call when the encryption has completed.|||
|`scope`|`Object`|The Function scope for the `callback` parameter, if provided.||`null`|

#### Example

Encrypts `config.json` into `config.encrypted.json` using the password `"b0sco"`.

```js
let nodecipher = require('node-cipher');

nodecipher.encrypt({
  input: 'config.json',
  output: 'config.encrypted.json',
  password: 'b0sco'
}, function (err) {
  if (err) throw err;

  console.log('config.json encrypted.');
});
```

***

### `encryptSync(options)`

The synchronous version of [`encrypt()`](#encryptoptions-callback-scope).

#### Parameters
|Parameter|Type|Description|Required|Default|
|--------:|:--:|:----------|:------:|:-----:|
|`options`|`Object`|See [options](#options).|✓||

#### Example

Synchronously encrypts `config.json` into `config.encrypted.json` using the password `"b0sco"`.

```js
let nodecipher = require('node-cipher');

nodecipher.encryptSync({
  input: 'config.json',
  output: 'config.encrypted.json',
  password: 'b0sco'
});
```

***

### `decrypt(options[, callback[, scope]])`

Decrypts a file using the [options](#options) provided.

#### Parameters
|Parameter|Type|Description|Required|
|--------:|:--:|:----------|:------:|
|`options`|`Object`|See [options](#options).|✓|
|`callback`|`Function`|The function to call when the decryption has completed.||
|`scope`|`Object`|The Function scope for the `callback` parameter, if provided.||`null`|

#### Example

Decrypts `config.encrypted.json` back into `config.json` using the password `"b0sco"`.

```js
let nodecipher = require('node-cipher');

nodecipher.decrypt({
  input: 'config.encrypted.json',
  output: 'config.json',
  password: 'b0sco'
}, function (err) {
  if (err) throw err;

  console.log('config.encrypted.json decrypted.');
});
```

***

### `decryptSync(options)`

The synchronous version of [`decrypt()`](#decryptoptions-callback-scope).

#### Parameters
|Parameter|Type|Description|Required|Default|
|--------:|:--:|:----------|:------:|:-----:|
|`options`|`Object`|See [options](#options).|✓||

#### Example

Synchronously decrypts `config.encrypted.json` back into `config.json` using the password `"b0sco"`.

```js
let nodecipher = require('node-cipher');

nodecipher.decryptSync({
  input: 'config.encrypted.json',
  output: 'config.json',
  password: 'b0sco'
});
```

***

### `list():Array`

Lists all available cipher algorithms as an Array.

#### Example

```js
let nodecipher = require('node-cipher');

console.log(nodecipher.list());
// => ['CAST-cbc', 'aes-128-cbc', ..., 'seed-ofb']
```


***


Authors
-------
* [Nathan Buchar](mailto:hello@nathanbuchar.com)


License
-------
MIT
