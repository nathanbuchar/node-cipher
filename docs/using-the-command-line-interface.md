Using the Command Line Interface
================================

[Click here][README] to return to the README.




Contents
--------

* [Installation][section_installation]
* [Usage][section_usage]
* [Commands][section_commands]
* [Options][section_options]
* [Examples][section_examples]
* [Tips][section_tips]



***



Installation
------------

To install `node-cipher`, simply run the following

    $ npm install -g node-cipher

This will install the `node-cipher` package globally so that you can use the `$ nodecipher` binary everywhere. If you are using `node-cipher` within a specific project, it is recommended that you install the package locally by omitting the `-g` flag and using the local binary via NPM. Read more about this [here][external_link_npm-scripts].




Usage
-----

```
$ nodecipher <encrypt|decrypt> <input> <output> [options]
```

When in doubt, `$ nodecipher --help`




Commands
--------

| Command   | Alias | Description                                              |
| :-------- | :---: | :------------------------------------------------------- |
| `encrypt` | `enc` | Encrypts the input file using the options provided. See [options][section_options]. |
| `decrypt` | `dec` | Decrypts the input file using the options provided. See [options][section_options]. |




Options
-----

| Flag           | Alias |   Type    | Description                   | Default |
| :------------- | :---: | :-------: | :---------------------------- | :-----: |
| `--password`   | `-p`  | `string`  | The password used to derive the encryption key. **For security reasons, it is recommended that you do not define the password as part of the command. Omit the `--password` option and `node-cipher` will prompt you for it separately via [inquirer][external_package_inquirer]. This way, the password is not exposed as part of your command history.** ||
| `--algorithm`  | `-a`  | `string`  | The cipher algorithm to use when encrypting or decrypting the input file. Use `$ nodecipher --algorithms` to see a list of available cipher algorithms. | `cast5-cbc` |
| `--salt`       | `-s`  | `string`  | The salt used to derive the encryption key. This should be as unique as possible. It is recommended that salts are random and their lengths are greater than 16 bytes. | `nodecipher` |
| `--iterations` | `-r`  | `number`  | The number of iterations used to derive the key. The higher the number of iterations, the more secure the derived key will be, but will take a longer amount of time to complete. | `1000` |
| `--keylen`     | `-l`  | `number`  | The desired byte length for the derived key. | `512` |
| `--digest`     | `-d`  | `string`  | The HMAC digest algorithm used to derive the key. Use `$ nodecipher --hashes` to see a list of available HMAC hashes. | `"sha1"` |
| `--algorithms` | `-A`  | `boolean` | Outputs a list of all available cipher algorithms.||
| `--hashes`     | `-H`  | `boolean` | Outputs a list of all available HMAC hashes.||
| `--version`    | `-V`  | `boolean` | Output the version number.||
| `--help`       | `-h`  | `boolean` | Output usage information.||



***



Examples
--------

1. Encrypts the contents of `config.json` using default settings, then saves the decrypted contents to a file named `config.json.cast5`. This is the basic use case.

    ```bash
    $ nodecipher encrypt "config.json" "config.json.cast5"

    ? Enter the password ********

    # Success: config.json → config.json.cast5
    ```

2. Encrypts the contents of `config.json` using a custom salt, then saves the decrypted contents to a file named `config.json.cast5`.

    ```bash
    $ nodecipher encrypt "config.json" "config.json.cast5" -s "alakazam"

    ? Enter the password ********

    # Success: config.json → config.json.cast5
    ```

3. Encrypts the contents of `config.json` using a custom salt, algorithm, digest, and byte length, then saves the decrypted contents to a file named `config.json.aes128`. This is an advanced use case.

    ```bash
    $ nodecipher enc "config.json" "config.json.aes128" -a "aes-128-cbc" -s "alakazam" -l 1024 -d
     "sha512"

    ? Enter the password ********

     # Success: config.json → config.json.aes128
    ```

4. Decrypts the contents of `config.json.cast5` using custom iterations, then saves the decrypted contents back to a file named `config.json`.

    ```bash
    $ nodecipher dec "config.json.cast5" "config.json" -i 100000

    ? Enter the password ********

    # Success: config.json.cast5 → config.json
    ```



***



Tips
----

### NPM

Using NPM, you can create custom scripts in the `package.json` file to automate much of the encryption/decryption process.

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

If you have installed `node-cipher` locally, NPM will automatically prefer the binary found in `node_modules/.bin` over a global binary. Read more about using local binaries within NPM [here][external_link_npm-scripts].

### Webpack

If you use webpack to process your files you can also use [decryption-loader][external_link_decryption-loader] to decrypt them.





[root]: ../
[README]: ../README.md

[section_installation]: #installation
[section_usage]: #usage
[section_commands]: #commands
[section_options]: #options
[section_examples]: #examples
[section_tips]: #tips

[external_package_inquirer]: https://npmjs.org/package/inquirer

[external_link_npm-scripts]: http://firstdoit.com/npm-scripts/

[external_link_decryption-loader]: https://www.npmjs.com/package/decryption-loader