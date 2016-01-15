/**
 * @fileoverview Mocha test specs.
 * @author Nathan Buchar
 */

/* global it, describe, before, after, beforeEach, afterEach */

'use strict';

let _ = require('lodash');
let chai = require('chai');
let crypto = require('crypto');
let fs = require('fs');
let path = require('path');
let tmp = require('tmp');

let nodecipher = require('../');

/**
 * Chai assertion shorthands.
 */
let expect = chai.expect;
let should = chai.should();

/**
 * Generates a random file within our `test/tmp` directory.
 *
 * @returns {Object}
 */
function makeRandomFileSync() {
  return tmp.fileSync({
    dir: 'test/tmp',
    prefix: 'nodecipher-',
    postfix: '.txt'
  });
}

describe('Methods', function () {

  let src;
  let enc;
  let dec;

  before('create tmp directory', function () {
    fs.mkdirSync('test/tmp');
  });

  beforeEach('generate temporary files', function () {
    src = makeRandomFileSync();
    enc = makeRandomFileSync();
    dec = makeRandomFileSync();
  });

  beforeEach('write to the src file', function () {
    fs.writeFileSync(src.name, 'I am the night!');
  });

  afterEach('destroy temporary files', function () {
    src.removeCallback();
    enc.removeCallback();
    dec.removeCallback();
  });

  after('remove tmp directory', function () {
    fs.rmdirSync('test/tmp');
  });

  /**
   * Test specs for encrypt().
   *
   * - should encrypt a file using the default algorithm
   * - should encrypt a file using a custom algorithm
   * - should apply a null scope to the callback if none is specified
   * - should apply the scope to the callback if specified
   */
  describe('encrypt()', function () {

    it('should encrypt a file using the default algorithm', function (done) {
      nodecipher.encrypt({
        input: src.name,
        output: enc.name,
        password: 'alakazam'
      }, function (err) {
        should.not.exist(err);
        done();
      });
    });

    it('should encrypt a file using a custom algorithm', function (done) {
      nodecipher.encrypt({
        input: src.name,
        output: enc.name,
        password: 'alakazam',
        algorithm: 'aes-128-cbc'
      }, function (err) {
        should.not.exist(err);
        done();
      });
    });

    it('should apply a null scope to the callback if none is specified', function (done) {
      nodecipher.encrypt({
        input: src.name,
        output: enc.name,
        password: 'alakazam'
      }, function (err) {
        should.not.exist(err);
        expect(this).to.equal(null);
        done();
      });
    });

    it('should apply the scope to the callback if specified', function (done) {
      let scope = {};

      nodecipher.encrypt({
        input: src.name,
        output: enc.name,
        password: 'alakazam'
      }, function (err) {
        should.not.exist(err);
        expect(scope).to.equal(scope);
        done();
      }, scope);
    });
  });

  /**
   * Test specs for encryptSync().
   *
   * - should encrypt a file using the default algorithm
   * - should encrypt a file using a custom algorithm
   */
  describe('encryptSync()', function () {

    it('should encrypt a file using the default algorithm', function () {
      try {
        nodecipher.encryptSync({
          input: src.name,
          output: enc.name,
          password: 'alakazam'
        });
      } catch (err) {
        should.not.exist(err);
      }
    });

    it('should encrypt a file using a custom algorithm', function () {
      try {
        nodecipher.encryptSync({
          input: src.name,
          output: enc.name,
          password: 'alakazam',
          algorithm: 'aes-128-cbc'
        });
      } catch (err) {
        should.not.exist(err);
      }
    });
  });

  /**
   * Test specs for decrypt().
   *
   * - should decrypt a file using the default algorithm
   * - should decrypt a file using a custom algorithm
   * - should apply a null scope to the callback if none is specified
   * - should apply the scope to the callback if specified
   * - should fail when using the wrong password
   * - should fail when using the wrong algorithm
   */
  describe('decrypt()', function () {

    it('should decrypt a file using the default algorithm', function (done) {

      // Generate the file to decrypt.
      nodecipher.encryptSync({
        input: src.name,
        output: enc.name,
        password: 'alakazam'
      });

      nodecipher.decrypt({
        input: enc.name,
        output: dec.name,
        password: 'alakazam'
      }, function (err) {
        should.not.exist(err);

        fs.readFile(dec.name, 'utf8', function (err, data) {
          should.not.exist(err);
          expect(data).to.equal('I am the night!');
          done();
        });
      });
    });

    it('should decrypt a file using a custom algorithm', function (done) {

      // Generate the file to decrypt.
      nodecipher.encryptSync({
        input: src.name,
        output: enc.name,
        password: 'alakazam',
        algorithm: 'aes-128-cbc'
      });

      nodecipher.decrypt({
        input: enc.name,
        output: dec.name,
        password: 'alakazam',
        algorithm: 'aes-128-cbc'
      }, function (err) {
        should.not.exist(err);

        fs.readFile(dec.name, 'utf8', function (err, data) {
          should.not.exist(err);
          expect(data).to.equal('I am the night!');
          done();
        });
      });
    });

    it('should apply a null scope to the callback if none is specified', function (done) {

      // Generate the file to decrypt.
      nodecipher.encryptSync({
        input: src.name,
        output: enc.name,
        password: 'alakazam'
      });

      nodecipher.decrypt({
        input: enc.name,
        output: dec.name,
        password: 'alakazam'
      }, function (err) {
        should.not.exist(err);
        expect(this).to.equal(null);
        done();
      });
    });

    it('should apply the scope to the callback if specified', function (done) {
      let scope = {};

      // Generate the file to decrypt.
      nodecipher.encryptSync({
        input: src.name,
        output: enc.name,
        password: 'alakazam'
      });

      nodecipher.decrypt({
        input: enc.name,
        output: dec.name,
        password: 'alakazam'
      }, function (err) {
        should.not.exist(err);
        expect(scope).to.equal(scope);
        done();
      }, scope);
    });

    it('should fail when using the wrong password', function (done) {

      // Generate the file to decrypt.
      nodecipher.encryptSync({
        input: src.name,
        output: enc.name,
        password: 'alakazam'
      });

      nodecipher.decrypt({
        input: enc.name,
        output: dec.name,
        password: 'not-alakazam'
      }, function (err) {
        should.exist(err);
        done();
      });
    });

    it('should fail when using the wrong algorithm', function (done) {

      // Generate the file to decrypt.
      nodecipher.encryptSync({
        input: src.name,
        output: enc.name,
        password: 'alakazam',
        algorithm: 'aes-256-cbc'
      });

      nodecipher.decrypt({
        input: enc.name,
        output: dec.name,
        password: 'alakazam',
        algorithm: 'cast5-cbc'
      }, function (err) {
        should.exist(err);
        done();
      });
    });
  });

  /**
   * Test specs for decryptSync().
   *
   * - should decrypt a file using the default algorithm
   * - should decrypt a file using a custom algorithm
   * - should fail when using the wrong password
   * - should fail when using the wrong algorithm
   */
  describe('decryptSync()', function () {

    it('should decrypt a file using the default algorithm', function (done) {

      // Generate the file to decrypt.
      nodecipher.encryptSync({
        input: src.name,
        output: enc.name,
        password: 'alakazam'
      });

      try {
        nodecipher.decryptSync({
          input: enc.name,
          output: dec.name,
          password: 'alakazam'
        });
      } catch (err) {
        should.not.exist(err);
      }

      fs.readFile(dec.name, 'utf8', function (err, data) {
        should.not.exist(err);
        expect(data).to.equal('I am the night!');
        done();
      });
    });

    it('should decrypt a file using a custom algorithm', function (done) {

      // Generate the file to decrypt.
      nodecipher.encryptSync({
        input: src.name,
        output: enc.name,
        password: 'alakazam',
        algorithm: 'aes-128-cbc'
      });

      try {
        nodecipher.decryptSync({
          input: enc.name,
          output: dec.name,
          password: 'alakazam',
          algorithm: 'aes-128-cbc'
        });
      } catch (err) {
        should.not.exist(err);
      }

      fs.readFile(dec.name, 'utf8', function (err, data) {
        should.not.exist(err);
        expect(data).to.equal('I am the night!');
        done();
      });
    });

    it('should fail when using the wrong password', function () {

      // Generate the file to decrypt.
      nodecipher.encryptSync({
        input: src.name,
        output: enc.name,
        password: 'alakazam'
      });

      try {
        nodecipher.decryptSync({
          input: enc.name,
          output: dec.name,
          password: 'not-alakazam'
        });
      } catch (err) {
        should.exist(err);
      }
    });

    it('should fail when using the wrong algorithm', function () {

      // Generate the file to decrypt.
      nodecipher.encryptSync({
        input: src.name,
        output: enc.name,
        password: 'alakazam',
        algorithm: 'aes-256-cbc'
      });

      try {
        nodecipher.decryptSync({
          input: enc.name,
          output: dec.name,
          password: 'alakazam',
          algorithm: 'cast5-cbc'
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

describe('Options', function () {

  let src;
  let enc;
  let dec;

  before('create tmp directory', function () {
    fs.mkdirSync('test/tmp');
  });

  beforeEach('generate temporary files', function () {
    src = makeRandomFileSync();
    enc = makeRandomFileSync();
    dec = makeRandomFileSync();
  });

  beforeEach('write to the src file', function () {
    fs.writeFileSync(src.name, 'I am the night!');
  });

  afterEach('destroy temporary files', function () {
    src.removeCallback();
    enc.removeCallback();
    dec.removeCallback();
  });

  after('remove tmp directory', function () {
    fs.rmdirSync('test/tmp');
  });

  it('should fail if no options are provided', function () {
    try {
      nodecipher.encryptSync();
    } catch (err) {
      should.exist(err);
    }
  });

  it('should fail if an input is not provided', function (done) {
    nodecipher.encrypt({
      output: src.name,
      password: 'alakazam'
    }, function (err) {
      should.exist(err);
      expect(err.toString()).to.equal('Error: "input" is required and must be a string.');
      done();
    });
  });

  it('should fail if the input is not a string', function (done) {
    nodecipher.encrypt({
      input: Array,
      output: enc.name,
      password: 'alakazam'
    }, function (err) {
      should.exist(err);
      expect(err.toString()).to.equal('Error: "input" is required and must be a string.');
      done();
    });
  });

  it('should fail if an output is not provided', function (done) {
    nodecipher.encrypt({
      input: src.name,
      password: 'alakazam'
    }, function (err) {
      should.exist(err);
      expect(err.toString()).to.equal('Error: "output" is required and must be a string.');
      done();
    });
  });

  it('should fail if the output is not a string', function (done) {
    nodecipher.encrypt({
      input: src.name,
      output: Array,
      password: 'alakazam'
    }, function (err) {
      should.exist(err);
      expect(err.toString()).to.equal('Error: "output" is required and must be a string.');
      done();
    });
  });

  it('should fail if a password is not provided', function (done) {
    nodecipher.encrypt({
      input: src.name,
      output: enc.name
    }, function (err) {
      should.exist(err);
      expect(err.toString()).to.equal('Error: "password" is required and must be a string.');
      done();
    });
  });

  it('should fail if the password is not a string', function (done) {
    nodecipher.encrypt({
      input: src.name,
      output: enc.name,
      password: Array
    }, function (err) {
      should.exist(err);
      expect(err.toString()).to.equal('Error: "password" is required and must be a string.');
      done();
    });
  });

  it('should fail if an invalid encryption algorithm is provided', function (done) {
    nodecipher.encrypt({
      input: src.name,
      output: enc.name,
      password: 'alakazam',
      algorithm: 'foobar'
    }, function (err) {
      should.exist(err);
      expect(err.toString()).to.equal('Error: "foobar" is not a valid cipher algorithm.');
      done();
    });
  });

  it('should fail if the encryption algorithm is not a string', function (done) {
    nodecipher.encrypt({
      input: src.name,
      output: enc.name,
      password: 'alakazam',
      algorithm: Array
    }, function (err) {
      should.exist(err);
      expect(err.toString()).to.equal('Error: "algorithm" is required and must be a string.');
      done();
    });
  });
});
