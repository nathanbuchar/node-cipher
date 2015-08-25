# node-cipher

Encrypt or decrypt sensitive files to allow use in public source control.



### Install

    npm install -g node-cipher



### Usage


    $ nodecipher <command> {options}


#### Commands

|Command|Description|
|:-----:|:----------|
|encrypt|Encrypts the given input file.|
|decrypt|Decrypts the given input file.|

#### Options

|Option|Alias|Type|Description|Required?|Default|
|:-----:|:---:|:--:|:----------|:-------:|:------|
|`--input`|`-i`|`string`|The input filename relative to the current working directory.|Yes|`null`|
|`--output`|`-o`|`string`|The output filename relative to the current working directory. This will be the encrypted version of the input file.|Yes|`null`|
|`--key`|`-k`|`string`|The key that you will use to encrypt or decrypt your file.|No|(A prompt will appear.)|
|`--algorithm`|`-a`|`string`|The cipher algorithm to use for your encryption or decryption method. [What are my options?](https://nodejs.org/api/crypto.html#crypto_crypto_getciphers)|No|`cast5-cbc`|
|`--help`|`-h`|`boolean`|Show the help menu.||||



### Example Usage

1. Encrypt `config.json` into `config.json.cast5` using the key `bosco` and the default cipher algorithm (`cast5`).

    ```bash
    $ nodecipher encrypt -i config.json -o config.json.cast5 -k bosco
    ```

2. Decrypt `config.json.cast5` back into `config.json` using the key `bosco` and the default cipher algorithm (`cast5`).

    ```bash
    $ nodecipher decrypt -i config.json.cast5 -o config.json -k bosco
    ```


3. Encrypt `classified.js` into `classified.encrypted.js` using the `aes-128-cbc` cipher algorithm and the password prompt.

    ```bash
    $ nodecipher encrypt -i classified.js -o classified.encrypted.js -a aes-128-cbc

      ? Enter an encryption key: ********
    ```

4. Decrypt the `.env.cast5` file on Heroku before running the application using the `CONFIG_KEY` environment variable.

    ```
    // Procfile

    web: nodecipher decrypt -i .env.cast5 -o .env -k $CONFIG_KEY; npm start;
    ```



### Node JS API

```
nodecipher.encrypt(src, dest, key[, algorithm][, callback])
```

```
nodecipher.decrypt(src, dest, key[, algorithm][, callback])
```



## Authors
* [Nathan Buchar](mailto:hello@nathanbuchar.com)



## License
MIT
