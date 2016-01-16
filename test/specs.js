/**
 * @fileoverview Mocha test specs.
 * @author Nathan Buchar
 */

/* global it, describe, before, after, beforeEach, afterEach */

'use strict';

let _ = require('lodash');
let chai = require('chai');
let crypto = require('crypto');
let fse = require('fs-extra');
let path = require('path');
let randomstring = require('randomstring');
let tmp = require('tmp');

let nodecipher = require('../');

/**
 * Chai assertion shorthands.
 */
let expect = chai.expect;
let should = chai.should();

/**
 * Declare tmp files and content.
 */
let files;
let content;

/**
 * Generates a random file within our `test/tmp` directory.
 *
 * @returns {Object}
 */
function makeRandomFileSync() {
  return tmp.fileSync({
    dir: 'test/.tmp',
    prefix: 'nodecipher-',
    postfix: '.txt'
  });
}

/**
 * Creates the `tmp` temporary directory sandbox for testing.
 */
before('create tmp directory', function () {
  fse.ensureDirSync('test/.tmp');
});

/**
 * Generates all necessary temporary files for encryption.
 */
beforeEach('generate temporary files', function () {
  files = [];

  for (let i = 0; i < 3; i++) {
    files.push(makeRandomFileSync());
  }
});

/**
 * Generates the random string that we will encrypt.
 */
beforeEach('generate random string', function () {
  content = randomstring.generate();
});

/**
 * Writes base content to the source file. This is what we will be encyrpting.
 */
beforeEach('write to the src file', function () {
  fse.writeFileSync(files[0].name, content);
});

/**
 * Destroys all temporary files used in the previous encryption test and sets
 * all values to null.
 */
afterEach('cleanup', function () {
  _.each(files, function (file) {
    file.removeCallback();
  });

  files = null;
  content = null;
});

/**
 * Removes the `temp` temporary directory sandbox we used for testing.
 */
after('remove tmp directory', function () {
  fse.removeSync('test/.tmp');
});

describe('Options', function () {

  it('should fail if no options are provided', function () {
    try {
      nodecipher.encryptSync();
    } catch (err) {
      should.exist(err);
    }
  });

  /**
   * Test specs for options.input.
   *
   * - should fail if not provided
   * - should fail if not a string
   */
  describe('input', function () {

    it('should fail if not provided', function (done) {
      nodecipher.encrypt({
        output: files[0].name,
        password: 'alakazam'
      }, function (err) {
        should.exist(err);
        expect(err.toString()).to.equal('Error: "input" is required and must be a string.');
        done();
      });
    });

    it('should fail if not a string', function (done) {
      nodecipher.encrypt({
        input: Array,
        output: files[1].name,
        password: 'alakazam'
      }, function (err) {
        should.exist(err);
        expect(err.toString()).to.equal('Error: "input" is required and must be a string.');
        done();
      });
    });
  });

  /**
   * Test specs for options.output.
   *
   * - should fail if not provided
   * - should fail if not a string
   */
  describe('output', function () {

    it('should fail if not provided', function (done) {
      nodecipher.encrypt({
        input: files[0].name,
        password: 'alakazam'
      }, function (err) {
        should.exist(err);
        expect(err.toString()).to.equal('Error: "output" is required and must be a string.');
        done();
      });
    });

    it('should fail if not a string', function (done) {
      nodecipher.encrypt({
        input: files[0].name,
        output: Array,
        password: 'alakazam'
      }, function (err) {
        should.exist(err);
        expect(err.toString()).to.equal('Error: "output" is required and must be a string.');
        done();
      });
    });
  });

  /**
   * Test specs for options.password.
   *
   * - should fail if not provided
   * - should fail if not a string
   */
  describe('password', function () {

    it('should fail if not provided', function (done) {
      nodecipher.encrypt({
        input: files[0].name,
        output: files[1].name
      }, function (err) {
        should.exist(err);
        expect(err.toString()).to.equal('Error: "password" is required and must be a string.');
        done();
      });
    });

    it('should fail if not a string', function (done) {
      nodecipher.encrypt({
        input: files[0].name,
        output: files[1].name,
        password: Array
      }, function (err) {
        should.exist(err);
        expect(err.toString()).to.equal('Error: "password" is required and must be a string.');
        done();
      });
    });
  });

  /**
   * Test specs for options.salt.
   *
   * - should fail if not a string
   */
  describe('salt', function () {

    it('should fail if not a string', function (done) {
      nodecipher.encrypt({
        input: files[0].name,
        output: files[1].name,
        password: 'alakazam',
        salt: Array
      }, function (err) {
        should.exist(err);
        expect(err.toString()).to.equal('Error: "salt" is required and must be a string.');
        done();
      });
    });
  });

  /**
   * Test specs for options.iterations.
   *
   * - should fail if not a number
   */
  describe('iterations', function () {

    it('should fail if not a string', function (done) {
      nodecipher.encrypt({
        input: files[0].name,
        output: files[1].name,
        password: 'alakazam',
        iterations: Array
      }, function (err) {
        should.exist(err);
        expect(err.toString()).to.equal('Error: "iterations" is required and must be a number.');
        done();
      });
    });
  });

  /**
   * Test specs for options.keylen.
   *
   * - should fail if not a number
   */
  describe('keylen', function () {

    it('should fail if not a string', function (done) {
      nodecipher.encrypt({
        input: files[0].name,
        output: files[1].name,
        password: 'alakazam',
        keylen: Array
      }, function (err) {
        should.exist(err);
        expect(err.toString()).to.equal('Error: "keylen" is required and must be a number.');
        done();
      });
    });
  });

  /**
   * Test specs for options.digest.
   *
   * - should fail if not a string
   */
  describe('digest', function () {

    it('should fail if not a string', function (done) {
      nodecipher.encrypt({
        input: files[0].name,
        output: files[1].name,
        password: 'alakazam',
        digest: Array
      }, function (err) {
        should.exist(err);
        expect(err.toString()).to.equal('Error: "digest" is required and must be a string.');
        done();
      });
    });
  });

  /**
   * Test specs for options.algorithm.
   *
   * - should fail if not valid
   * - should fail if not a string
   */
  describe('algorithm', function () {

    it('should fail if not valid', function (done) {
      nodecipher.encrypt({
        input: files[0].name,
        output: files[1].name,
        password: 'alakazam',
        algorithm: 'foobar'
      }, function (err) {
        should.exist(err);
        expect(err.toString()).to.equal('Error: "foobar" is not a valid cipher algorithm.');
        done();
      });
    });

    it('should fail if not a string', function (done) {
      nodecipher.encrypt({
        input: files[0].name,
        output: files[1].name,
        password: 'alakazam',
        algorithm: Array
      }, function (err) {
        should.exist(err);
        expect(err.toString()).to.equal('Error: "algorithm" is required and must be a string.');
        done();
      });
    });
  });
});

describe('Methods', function () {

  /**
   * Test specs for encrypt().
   *
   * - should succeed using the default algorithm
   * - should succeed using a custom algorithm
   * - should apply a null scope to the callback if none is specified
   * - should apply the scope to the callback if specified
   * - should fail if the input does not exist
   */
  describe('encrypt()', function () {

    it('should succeed using the default algorithm', function (done) {
      nodecipher.encrypt({
        input: files[0].name,
        output: files[1].name,
        password: 'alakazam'
      }, function (err) {
        should.not.exist(err);
        done();
      });
    });

    it('should succeed using a custom algorithm', function (done) {
      nodecipher.encrypt({
        input: files[0].name,
        output: files[1].name,
        password: 'alakazam',
        algorithm: 'aes-128-cbc'
      }, function (err) {
        should.not.exist(err);
        done();
      });
    });

    it('should apply a null scope to the callback if none is specified', function (done) {
      nodecipher.encrypt({
        input: files[0].name,
        output: files[1].name,
        password: 'alakazam'
      }, function (err) {
        should.not.exist(err);
        expect(this).to.equal(undefined);
        done();
      });
    });

    it('should apply the scope to the callback if specified', function (done) {
      let scope = {};

      nodecipher.encrypt({
        input: files[0].name,
        output: files[1].name,
        password: 'alakazam'
      }, function (err) {
        should.not.exist(err);
        expect(scope).to.equal(scope);
        done();
      }, scope);
    });

    it('should fail if the input does not exist', function (done) {
      nodecipher.encrypt({
        input: 'notarealfile.txt',
        output: files[1].name,
        password: 'alakazam'
      }, function (err) {
        should.exist(err);
        done();
      });
    });
  });

  /**
   * Test specs for encryptSync().
   *
   * - should succeed using the default algorithm
   * - should succeed using a custom algorithm
   * - should fail if the input does not exist
   */
  describe('encryptSync()', function () {

    it('should succeed using the default algorithm', function () {
      try {
        nodecipher.encryptSync({
          input: files[0].name,
          output: files[1].name,
          password: 'alakazam'
        });
      } catch (err) {
        should.not.exist(err);
      }
    });

    it('should succeed using a custom algorithm', function () {
      try {
        nodecipher.encryptSync({
          input: files[0].name,
          output: files[1].name,
          password: 'alakazam',
          algorithm: 'aes-128-cbc'
        });
      } catch (err) {
        should.not.exist(err);
      }
    });

    it('should fail if the input does not exist', function () {
      try {
        nodecipher.encryptSync({
          input: 'notarealfile.txt',
          output: files[1].name,
          password: 'alakazam'
        });
      } catch (err) {
        should.exist(err);
      }
    });
  });

  /**
   * Test specs for decrypt().
   *
   * - should succeed using the default algorithm
   * - should succeed using a custom algorithm
   * - should succeed using a custom salt
   * - should succeed using custom key iterations
   * - should succeed using a custom keylen
   * - should succeed using a custom digest
   * - should apply a null scope to the callback if none is specified
   * - should apply the scope to the callback if specified
   * - should fail when using the wrong password
   * - should fail when using the wrong algorithm
   * - should fail if the input does not exist
   */
  describe('decrypt()', function () {

    /**
     * Creates the encrypted file that we will test our decrypt methods on.
     */
    beforeEach('create the encrypted file', function () {
      nodecipher.encryptSync({
        input: files[0].name,
        output: files[1].name,
        password: 'alakazam'
      });
    });

    it('should succeed using the default algorithm', function (done) {
      nodecipher.decrypt({
        input: files[1].name,
        output: files[2].name,
        password: 'alakazam'
      }, function (err) {
        should.not.exist(err);

        fse.readFile(files[2].name, 'utf8', function (err, data) {
          should.not.exist(err);
          expect(data).to.equal(content);
          done();
        });
      });
    });

    it('should succeed using a custom algorithm', function (done) {

      // Overwrite the encrypted file using a custom algorithm.
      nodecipher.encryptSync({
        input: files[0].name,
        output: files[1].name,
        password: 'alakazam',
        algorithm: 'aes-128-cbc'
      });

      nodecipher.decrypt({
        input: files[1].name,
        output: files[2].name,
        password: 'alakazam',
        algorithm: 'aes-128-cbc'
      }, function (err) {
        should.not.exist(err);

        fse.readFile(files[2].name, 'utf8', function (err, data) {
          should.not.exist(err);
          expect(data).to.equal(content);
          done();
        });
      });
    });

    it('should succeed using a custom salt', function (done) {

      // Overwrite the encrypted file using a custom algorithm.
      nodecipher.encryptSync({
        input: files[0].name,
        output: files[1].name,
        password: 'alakazam',
        salt: 'abracadabra'
      });

      nodecipher.decrypt({
        input: files[1].name,
        output: files[2].name,
        password: 'alakazam',
        salt: 'abracadabra'
      }, function (err) {
        should.not.exist(err);

        fse.readFile(files[2].name, 'utf8', function (err, data) {
          should.not.exist(err);
          expect(data).to.equal(content);
          done();
        });
      });
    });

    it('should succeed using custom key iterations', function (done) {

      // Overwrite the encrypted file using a custom algorithm.
      nodecipher.encryptSync({
        input: files[0].name,
        output: files[1].name,
        password: 'alakazam',
        iterations: 1001
      });

      nodecipher.decrypt({
        input: files[1].name,
        output: files[2].name,
        password: 'alakazam',
        iterations: 1001
      }, function (err) {
        should.not.exist(err);

        fse.readFile(files[2].name, 'utf8', function (err, data) {
          should.not.exist(err);
          expect(data).to.equal(content);
          done();
        });
      });
    });

    it('should succeed using a custom keylen', function (done) {

      // Overwrite the encrypted file using a custom algorithm.
      nodecipher.encryptSync({
        input: files[0].name,
        output: files[1].name,
        password: 'alakazam',
        keylen: 256
      });

      nodecipher.decrypt({
        input: files[1].name,
        output: files[2].name,
        password: 'alakazam',
        keylen: 256
      }, function (err) {
        should.not.exist(err);

        fse.readFile(files[2].name, 'utf8', function (err, data) {
          should.not.exist(err);
          expect(data).to.equal(content);
          done();
        });
      });
    });

    it('should succeed using a custom digest', function (done) {

      // Overwrite the encrypted file using a custom algorithm.
      nodecipher.encryptSync({
        input: files[0].name,
        output: files[1].name,
        password: 'alakazam',
        digest: 'sha256'
      });

      nodecipher.decrypt({
        input: files[1].name,
        output: files[2].name,
        password: 'alakazam',
        digest: 'sha256'
      }, function (err) {
        should.not.exist(err);

        fse.readFile(files[2].name, 'utf8', function (err, data) {
          should.not.exist(err);
          expect(data).to.equal(content);
          done();
        });
      });
    });

    it('should apply a null scope to the callback if none is specified', function (done) {
      nodecipher.decrypt({
        input: files[1].name,
        output: files[2].name,
        password: 'alakazam'
      }, function (err) {
        should.not.exist(err);
        expect(this).to.equal(undefined);
        done();
      });
    });

    it('should apply the scope to the callback if specified', function (done) {
      let scope = {};

      nodecipher.decrypt({
        input: files[1].name,
        output: files[2].name,
        password: 'alakazam'
      }, function (err) {
        should.not.exist(err);
        expect(scope).to.equal(scope);
        done();
      }, scope);
    });

    it('should fail when using the wrong password', function (done) {
      nodecipher.decrypt({
        input: files[1].name,
        output: files[2].name,
        password: 'not-alakazam'
      }, function (err) {
        should.exist(err);
        done();
      });
    });

    it('should fail when using the wrong algorithm', function (done) {
      nodecipher.decrypt({
        input: files[1].name,
        output: files[2].name,
        password: 'alakazam',
        algorithm: 'aes-128-cbc'
      }, function (err) {
        should.exist(err);
        done();
      });
    });

    it('should fail if the input does not exist', function (done) {
      nodecipher.decrypt({
        input: 'notarealfile.txt',
        output: files[2].name,
        password: 'alakazam'
      }, function (err) {
        should.exist(err);
        done();
      });
    });
  });

  /**
   * Test specs for decryptSync().
   *
   * - should succeed using the default algorithm
   * - should succeed using a custom algorithm
   * - should succeed using a custom salt
   * - should succeed using custom key iterations
   * - should succeed using a custom keylen
   * - should succeed using a custom digest
   * - should fail when using the wrong password
   * - should fail when using the wrong algorithm
   * - should fail if the input does not exist
   */
  describe('decryptSync()', function () {

    /**
     * Creates the encrypted file that we will test our decrypt methods on.
     */
    beforeEach('create the encrypted file', function () {
      nodecipher.encryptSync({
        input: files[0].name,
        output: files[1].name,
        password: 'alakazam'
      });
    });

    it('should succeed using the default algorithm', function (done) {
      try {
        nodecipher.decryptSync({
          input: files[1].name,
          output: files[2].name,
          password: 'alakazam'
        });
      } catch (err) {
        should.not.exist(err);
      }

      fse.readFile(files[2].name, 'utf8', function (err, data) {
        should.not.exist(err);
        expect(data).to.equal(content);
        done();
      });
    });

    it('should succeed using a custom algorithm', function (done) {

      // Overwrite the encrypted file using a custom algorithm.
      nodecipher.encryptSync({
        input: files[0].name,
        output: files[1].name,
        password: 'alakazam',
        algorithm: 'aes-128-cbc'
      });

      try {
        nodecipher.decryptSync({
          input: files[1].name,
          output: files[2].name,
          password: 'alakazam',
          algorithm: 'aes-128-cbc'
        });
      } catch (err) {
        should.not.exist(err);
      }

      fse.readFile(files[2].name, 'utf8', function (err, data) {
        should.not.exist(err);
        expect(data).to.equal(content);
        done();
      });
    });

    it('should succeed using a custom salt', function (done) {

      // Overwrite the encrypted file using a custom algorithm.
      nodecipher.encryptSync({
        input: files[0].name,
        output: files[1].name,
        password: 'alakazam',
        salt: 'abracadabra'
      });

      try {
        nodecipher.decryptSync({
          input: files[1].name,
          output: files[2].name,
          password: 'alakazam',
          salt: 'abracadabra'
        });
      } catch (err) {
        should.not.exist(err);
      }

      fse.readFile(files[2].name, 'utf8', function (err, data) {
        should.not.exist(err);
        expect(data).to.equal(content);
        done();
      });
    });

    it('should succeed using custom key iterations', function (done) {

      // Overwrite the encrypted file using a custom algorithm.
      nodecipher.encryptSync({
        input: files[0].name,
        output: files[1].name,
        password: 'alakazam',
        iterations: 1001
      });

      try {
        nodecipher.decryptSync({
          input: files[1].name,
          output: files[2].name,
          password: 'alakazam',
          iterations: 1001
        });
      } catch (err) {
        should.not.exist(err);
      }

      fse.readFile(files[2].name, 'utf8', function (err, data) {
        should.not.exist(err);
        expect(data).to.equal(content);
        done();
      });
    });

    it('should succeed using a custom keylen', function (done) {

      // Overwrite the encrypted file using a custom algorithm.
      nodecipher.encryptSync({
        input: files[0].name,
        output: files[1].name,
        password: 'alakazam',
        keylen: 256
      });

      try {
        nodecipher.decryptSync({
          input: files[1].name,
          output: files[2].name,
          password: 'alakazam',
          keylen: 256
        });
      } catch (err) {
        should.not.exist(err);
      }

      fse.readFile(files[2].name, 'utf8', function (err, data) {
        should.not.exist(err);
        expect(data).to.equal(content);
        done();
      });
    });

    it('should succeed using a custom digest', function (done) {

      // Overwrite the encrypted file using a custom algorithm.
      nodecipher.encryptSync({
        input: files[0].name,
        output: files[1].name,
        password: 'alakazam',
        digest: 'sha256'
      });

      try {
        nodecipher.decryptSync({
          input: files[1].name,
          output: files[2].name,
          password: 'alakazam',
          digest: 'sha256'
        });
      } catch (err) {
        should.not.exist(err);
      }

      fse.readFile(files[2].name, 'utf8', function (err, data) {
        should.not.exist(err);
        expect(data).to.equal(content);
        done();
      });
    });

    it('should fail when using the wrong password', function () {
      try {
        nodecipher.decryptSync({
          input: files[1].name,
          output: files[2].name,
          password: 'not-alakazam'
        });
      } catch (err) {
        should.exist(err);
      }
    });

    it('should fail when using the wrong algorithm', function () {
      try {
        nodecipher.decryptSync({
          input: files[1].name,
          output: files[2].name,
          password: 'alakazam',
          algorithm: 'aes-128-cbc'
        });
      } catch (err) {
        should.exist(err);
      }
    });

    it('should fail if the input does not exist', function () {
      try {
        nodecipher.decryptSync({
          input: 'notarealfile.txt',
          output: files[2].name,
          password: 'alakazam'
        });
      } catch (err) {
        should.exist(err);
      }
    });
  });

  /**
   * Test specs for list().
   *
   * - should return an array of valid algorithms
   */
  describe('list()', function () {

    it('should return an array of valid algorithms', function () {
      let algorithms = nodecipher.list();

      expect(algorithms).to.be.an('array');
      expect(_.difference(algorithms, crypto.getCiphers())).to.have.length(0);
    });
  });
});
