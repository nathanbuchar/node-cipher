# node-cipher

Encrypt or decrypt sensitive files to allow use in public source control. Node-cipher has a much more defined command line interface, as well as a public API for use directly within Node JS apps. [Find on NPM](https://www.npmjs.com/package/node-cipher)



### Example

Let's say we have a file called `config.json` which has some sensitive data in it, like private keys and shit. What happens if we need to transfer these configs between team members, but don't want the data within the file to be public within source control? We could send out a mass email with the new config file every time someone makes a change, or we can encrypt the file and add its encrypted counterpart to source control which can later be decrypted on each developer's machine.

Here's our hypothetical `config.json` file.

```json
{
  "SECRET": "s3cr3tc0de"
}
```

We want to remove this file from source control, so that the raw version of the file is not viewable. Instead we want to use the encrypted version of the file. Just add `config.json` to your `.gitignore`.

```bash
echo config.json >> .gitignore
```

We can create shorthand npm scripts to encrypt and decrypt this file for ease of use. In our `package.json`, we add:

```json
{
  ...
  "scripts": {
    "encrypt": "nodecipher encrypt -i config.json -o config.json.cast5",
    "decrypt": "nodecipher decrypt -i config.json.cast5 -o config.json"
  }
}
```

When run, the `encrypt` script will encrypt the `config.json` file into `config.json.cast5` which we can then check into source control. The `decrypt` script will reverse this process. Let's encrypt the file:

```bash
npm run encrypt
```

Before the file is encrypted, we will first be asked to supply an encryption key that will be used to encrypt the file. This is the only secret item you must share between your team:

```bash
? Enter an encryption key: ***********
```

If the key is correct, the file will be successfully encrypted, and other team members can pull down your changes and decrypt the new config file using `npm run decrypt`.



### Install

```
npm install -g node-cipher
```



### Usage


```
Usage: nodecipher <command> {options}


Commands:

  encrypt  Encrypt a given file.
  decrypt  Decrypt a given file.
     list  List all available cipher options.

Options:

       --help, -h  Show the help menu.

    --version, -v  Show version number.

```

#### Encrypt/Decrypt

```

Usage: nodecipher [encrypt|decrypt] -i string -o string[ -p string][ -a string]


Options:

      --input, -i  The input filename relative to the current working directory. (Required)

     --output, -o  The output filename relative to the current working directory. (Required)

   --password, -p  The key that you will use to encrypt or decrypt your file. If this is not
                   supplied directly, you will instead be prompted within your command line.
                   If you are decrypting a file, the password must be the same as the one
                   specified during encryption. (Optional)

  --algorithm, -a  The cipher algorithm that you will use to encrypt or decrypt your file. If
                   you are decrypting a file, the encryption method must be the same as the
                   one specified during encryption. By default, the encryption algorithm is
                   set to `cast5-cbc`. Use `nodecipher list` to see a list of available
                   cipher algorithms. (Optional; Default: cast5-cbc)

       --help, -h  Show the help menu.

```



### Node JS API

Encryption/Decryption API:

```javascript
import {encrypt, decrypt, list} from 'node-cipher';


/**
 * Using callbacks.
 */

encrypt(options, function () {
  console.log('File encrypted.');
});

decrypt(options, function () {
  console.log('File decrypted.');
});


/**
 * Using promises.
 */

encrypt(options).then(function () {
  console.log('File encrypted.');
});

decrypt(options).then(function () {
  console.log('File decrypted.');
});


/**
 * List all available cipher algorithms.
 */

 list(); // => ['CAST-cbc', 'aes-128-cbc', ..., 'seed-ofb']
```

#### Options

|Name|Type|Description|Required|
|:---|:--:|:----------|:------:|
|`input`|`string`|The input filename relative to the current working directory.|Yes|
|`output`|`string`|The output filename relative to the current working directory.|Yes|
|`password`|`string`|The encryption password. Unlike the command line interface, this MUST be specified.|Yes|
|`algorithm`|`string`|The algorithm to use. Use `nodecipher list` to see a list of available cipher algorithms. Default: `cast5-cbc`|No|



### Example Usage

1. Encrypt `config.json` into `config.json.cast5` using the key `bosco` and the default cipher algorithm (`cast5`).

    ```bash
    $ nodecipher encrypt -i config.json -o config.json.cast5 -p bosco
    ```

2. Decrypt `config.json.cast5` back into `config.json` using the key `bosco` and the default cipher algorithm (`cast5`).

    ```bash
    $ nodecipher decrypt -i config.json.cast5 -o config.json -p bosco
    ```


3. Encrypt `classified.js` into `classified.encrypted.js` using the `aes-128-cbc` cipher algorithm and the password prompt.

    ```bash
    $ nodecipher encrypt -i classified.js -o classified.encrypted.js -a aes-128-cbc

      ? Enter an encryption key: ********
    ```

4. Decrypt the `.env.cast5` file on Heroku before running the application using the `CONFIG_KEY` environment variable.

    ```
    // Procfile

    web: nodecipher decrypt -i .env.cast5 -o .env -p $CONFIG_KEY; npm start;
    ```



## Authors
* [Nathan Buchar](mailto:hello@nathanbuchar.com)



## License
MIT
