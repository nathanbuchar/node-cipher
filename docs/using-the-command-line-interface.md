Command Line Interface Guide
============================

**Welcome!**

This is the command line interface (CLI) documentation for node-cipher. Below, you'll find instructions on installation and usage.


***


Install
-------

```
$ npm install -g node-cipher
```


Usage
-----

```
$ nodecipher <encrypt|decrypt> <input> <output> [options]
```

When in doubt, `$ nodecipher --help`


Commands
--------

|Command|Alias|Description|
|:------|:---:|:----------|
|`encrypt`|`enc`|Encrypts the input file using the options provided. See [options](#options).|
|`decrypt`|`dec`|Decrypts the input file using the options provided. See [options](#options).|


Options
-----

|Flag|Alias|Type|Description|Default|
|:---|:---:|:--:|:----------|:-----:|
|`--help`|`-h`|`boolean`|Output usage information.|
|`--password`|`-p`|`string`|The password that we will use to derive the encryption key from. if a password is not provided by the user, they will be prompted to provide one via [inquirer](https://npmjs.org/package/inquirer).||
|`--salt`|`-s`|`string`|The salt to use when deriving the encryption key.|`"nodecipher"`|
|`--iterations`|`-r`|`number`|The number of iterations to use when deriving the key. The higher the number of iterations, the more secure the derived key will be, but will take a longer amount of time to complete.|`1000`|
|`--keylen`|`-l`|`number`|The desired byte length for the derived key.|`512`|
|`--digest`|`-d`|`string`|The HMAC digest algorithm to use to derive the key. Use `$ nodecipher --hashes` to see a list of available HMAC hashes.|`"sha1"`|
|`--algorithm`|`-a`|`string`|The cipher algorithm to use when encrypting or decrypting the input file. Use `$ nodecipher --algorithms` to see a list of available cipher algorithms.|`cast5-cbc`|
|`--algorithms`|`-L`|`boolean`|Outputs a list of all available cipher algorithms.|
|`--hashes`|`-H`|`boolean`|Outputs a list of all available HMAC hashes.|
|`--version`|`-V`|`boolean`|Output the version number.|


Examples
-------

1. Encrypts `config.json` into `config.json.aes128` using the `aes-128-cbc` cipher algorithm.

    ```bash
    $ nodecipher encrypt "config.json" "config.json.aes128" -a "aes-128-cbc"
    ```

2. Encrypts `config.json` into `config.json.cast5` using the default algorithm and a salt of `"abrakadabra"`.

    ```bash
    $ nodecipher encrypt "config.json" "config.json.cast5" -s "abrakadabra"
    ```

3. Decrypts `config.json.cast5` back into `config.json` using the default algorithm and a salt of `"abrakadabra"`.

    ```bash
    $ nodecipher dec "config.json.cast5" "config.json" -s "abrakadabra"
    ```


***


Tips
----

Using NPM, you can create custom scripts in our `package.json` file to automate much of the encryption/decryption process.

```js
{
  // ...
  "scripts": {
    "encrypt": "nodecipher encrypt config.json config.json.aes128",
    "decrypt": "nodecipher decrypt config.json.aes128 config.json"
  }
}
```

Simply run `$ npm run encrypt` or `$ npm run decrypt` to execute these commands.
