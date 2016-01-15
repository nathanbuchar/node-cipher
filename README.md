node-cipher
===========

Securely encrypt sensitive files for use in public source control. [Find on NPM](https://www.npmjs.com/package/node-cipher).


**Why would I want to encrypt my files?**

Let's say you have a file in your project name `config.json` which contains sensitive information like private keys and database passwords.

What happens if you want to publicly host a repository containing this file? Certainly you wouldn't want to make the contents of `config.json` visible to the outside world, so instead you can use **node-cipher** to encrypt the file and add its encrypted counterpart to source control, which can later be decrypted using the encryption key when the repository is cloned.

Just don't forget to add the original `config.json` file to `.gitignore`!


***


Table of Contents
-----------------

* [Install](#install)
* [Command Line Interface](#command-line-interface)
  * [Usage](#usage)
  * [Commands](#commands)
  * [Flags](#flags)
* [Node JS API](#node-js-api)
  * [Options](#options)
  * [Methods](#methods)
    * [`encrypt()`](#encryptoptions-callback-scope)
    * [`decrypt()`](#decryptoptions-callback-scope)
    * [`list()`](#listarray)
* [Tips](#tips)
* [Authors](#authors)
* [License](#license)


***


Install
-------

```
$ npm install -g node-cipher
```


***


## Command Line Interface

Looking for the Node JS API? [Click here](#node-js-api).


### Usage

```
$ nodecipher [--list] <command> -i input -o output [-p password] [-a algorithm]
```

When in doubt, `$ nodecipher --help`


### Commands

|Command|Description|
|:---|:----------|
|`encrypt`|Encrypts a file using the [arguments](#arguments) provided.|
|`decrypt`|Decrypts a file using the [arguments](#arguments) provided.|


### Flags

|Flag|Alias|Description|Required|Default|
|:---|:----|:----------|:------:|:-----:|
|`input`|`i`|The input filename relative to the current working directory.|✓||
|`output`|`p`|The output filename relative to the current working directory.|✓||
|`password`|`p`|The key that you will use to encrypt or decrypt your file. If this is not supplied directly, you will instead be prompted within your command line. If you are decrypting a file, the password must be the same as the one specified during encryption, or else the decryption will fail.|||
|`algorithm`|`a`|The cipher algorithm that you will use to encrypt or decrypt your file. If you are decrypting a file, the chosen algorithm must be the same as the one specified during encryption, or else the decryption will fail.||`cast5-cbc`|
|`list`|`l`|Lists all available cipher algorithms.|
|`version`|`v`|Show the node-cipher version.|
|`help`|`h`|Show the help menu.|


### Example

Encrypts `config.json` into `config.encrypted.json` using the `aes-128-cbc` cipher algorithm.

```bash
$ nodecipher encrypt -i "config.json" -o "config.encrypted.json" -a aes-128-cbc
```


***


Node JS API
-----------

Looking for the CLI? [Click here](#command-line-interface).


### Options

|Name|Type|Description|Required|Default|
|:---|:--:|:----------|:------:|:-----:|
|`input`|`string`|The input filename relative to the current working directory.|✓||
|`output`|`string`|The output filename relative to the current working directory.|✓||
|`password`|`string`|The encryption password. Unlike the command line interface, this MUST be specified.|✓||
|`algorithm`|`string`|The algorithm to use. Use `nodecipher -l` to see a list of available cipher algorithms.||`"cast5-cbc"`|


### Methods

* [`encrypt()`](#encryptoptions-callback-scope)
* [`decrypt()`](#decryptoptions-callback-scope)
* [`list()`](#listarray)

***

#### `encrypt(options[, callback[, scope]])`

Encrypt a file using the [options](#options) provided.

##### Parameters
|Parameter|Type|Description|Required|
|--------:|:--:|:----------|:------:|
|`options`|`Object`|The NodeCipher [options](#options) Object.|✓|
|`callback`|`Function`|The function to call when the encryption has completed.||
|`scope`|`Object`|The Function scope for the `callback` parameter, if provided.||

##### Example

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

#### `decrypt(options[, callback[, scope]])`

Decrypts a file using the [options](#options) provided.

##### Parameters
|Parameter|Type|Description|Required|
|--------:|:--:|:----------|:------:|
|`options`|`Object`|The NodeCipher [options](#options) Object.|✓|
|`callback`|`Function`|The function to call when the decryption has completed.||
|`scope`|`Object`|The Function scope for the `callback` parameter, if provided.||

##### Example

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

#### `list():Array`

Lists all available cipher algorithms as an Array.

##### Example

```js
let nodecipher = require('node-cipher');

console.log(nodecipher.list());
// => ['CAST-cbc', 'aes-128-cbc', ..., 'seed-ofb']
```


***


Tips
----

Using NPM, you can create custom scripts in our `package.json` file to automate much of the encryption/decryption process.

```js
{
  // ...
  "scripts": {
    "encrypt": "nodecipher encrypt -i config.json -o config.encrypted.json",
    "decrypt": "nodecipher decrypt -i config.encrypted.json -o config.json"
  }
}
```

Simply run `npm run encrypt` or `npm run decrypt` to execute these commands.


Authors
-------
* [Nathan Buchar](mailto:hello@nathanbuchar.com)


License
-------
MIT
