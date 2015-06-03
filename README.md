# config-cipher

Configuration files often contain sensitive information like API keys and passwords and shouldn't be kept in plaintext. This is where config-cipher comes in, it will encrypt your config files so that you can publish them without exposing your sensitive information to the public. To decrypt a file, simply enter the password that you originally encrypted the file with. Based on Jed Schmidt's [config-leaf](https://github.com/jed/config-leaf).



### Setup

First, install the package as a project dependency:

```bash
npm install config-cipher --save
```

Second, you'll need to edit your `package.json` file and add the `encrypt` and `decrypt` scripts:

```json
{
  "scripts": {
    "encrypt": "encrypt config.json config.json.cast5",
    "decrypt": "decrypt config.json.cast5 config.json"
  }
}
```

You of course can use any source and destination file name you'd like, just simply follow this pattern when writing your scripts:

```
[encrypt|decrypt] <source> <destination>
```

And last, make sure that the file you will be encrypting is added to your `.gitignore` file so that it won't be checked in when pushing to get.

```bash
echo config.json >> .gitignore
```



### Usage

For the sake of demonstration, let's assume that we're working on a Node.js project and we need to store some sensitive information such as API keys and passwords in a config file. The problem however is that the repository is accessible to the public, which means that all your sensitive information will be exposed if you check in your config file. file-cipher solves this by creating an encrypted copy of your config file that you can later decrypt with a master password.

To encrypt a config file, simply run

```bash
npm run encrypt
```

Similarly, to decrypt the config file, run

```bash
npm run decrypt
```

You can change the filenames and destinations of your encrypted file in the `package.json` scripts mentioned in [setup](#setup).



### Making Your Own Binary

Alternatively, instead of using npm scripts, you can create your own custom binary that ties in with the config-cipher binaries. For this example, let's create a binary called `encrypt` in a directory called `bin` at the project root. Inside this file, you can write the exact same script as you would in your `package.json`.

```bash
#!/usr/bin/env bash

encrypt config.json config.json.cast5
```

Next, register the file as executable

```bash
chmod u+x bin/encrypt
```

Now, to encrypt your config file, simply run

```bash
bin/encrypt
```

You can follow the same process for creating a `decrypt` binary as well.



### Heroku
You may wish to also test your build on [Heroku](http://heroku.com) and need to decrypt the config file on the fly. To do this, you could [add an environment variable](https://devcenter.heroku.com/articles/config-vars) called `CONFIG_KEY` with the config password, and then in your `Procfile` you can call the `decrypt` binary directly and pass in the config key. For example:

```
web: echo $CONFIG_KEY | node_modules/.bin/decrypt config.json.cast5 config.json; ...
```

Or if you've set up your own binaries:

```
web: echo $CONFIG_KEY | bin/decrypt; ...
```



## Authors
* [Nathan Buchar](mailto:hello@nathanbuchar.com)



## License
MIT
