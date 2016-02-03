/**
 * @fileoverview Mocha test specs.
 * @author Nathan Buchar
 */

 /* globals it, describe, before, after, beforeEach, afterEach */
 /* globals which, echo, exit, exec */

'use strict';

require('shelljs/global');

let _ = require('lodash');
let chai = require('chai');
let crypto = require('crypto');
let fs = require('fs-extra');
let randomstring = require('randomstring');
let tmp = require('tmp');

let nodecipher = require('../');

let Package = require('../package.json');
let bin = Package.bin.nodecipher;

/**
 * Chai assertion shorthands.
 */
let expect = chai.expect;
let should = chai.should();

describe('Flags', function () {

  this.timeout(5000);

  /**
   * Test specs for help.
   *
   * - should accept --help
   * - should accept -h
   */
  describe('help', function () {

    it('should accept --help', function (done) {
      let cmd = bin + ' --help';

      exec(cmd, { silent: true }, function (code, output) {
        expect(output).to.be.a('string');
        expect(output).to.have.length.above(0);
        expect(output).to.not.contain('Not enough non-option arguments');
        done();
      });
    });

    it('should accept -h', function (done) {
      let cmd = bin + ' -h';

      exec(cmd, { silent: true }, function (code, output) {
        expect(output).to.be.a('string');
        expect(output).to.have.length.above(0);
        expect(output).to.not.contain('Not enough non-option arguments');
        done();
      });
    });
  });

  /**
   * Test specs for version.
   *
   * - should accept --version
   * - should accept -v
   */
  describe('version', function () {

    it('should accept --version', function (done) {
      let cmd = bin + ' --version';

      exec(cmd, { silent: true }, function (code, output) {
        expect(output).to.be.a('string');
        expect(output).to.have.length.above(0);
        expect(output).to.equal(Package.version + '\n');
        done();
      });
    });

    it('should accept -V', function (done) {
      let cmd = bin + ' -V';

      exec(cmd, { silent: true }, function (code, output) {
        expect(output).to.be.a('string');
        expect(output).to.have.length.above(0);
        expect(output).to.equal(Package.version + '\n');
        done();
      });
    });
  });

  /**
   * Test specs for algorithms.
   *
   * - should accept --algorithms
   * - should accept -A
   */
  describe('algorithms', function () {

    it('should accept --algorithms', function (done) {
      let cmd = bin + ' --algorithms';

      exec(cmd, { silent: true }, function (code, output) {
        expect(output).to.be.a('string');
        expect(output).to.have.length.above(0);
        expect(output).to.equal(crypto.getCiphers().join('\n') + '\n');
        done();
      });
    });

    it('should accept -A', function (done) {
      let cmd = bin + ' -A';

      exec(cmd, { silent: true }, function (code, output) {
        expect(output).to.be.a('string');
        expect(output).to.have.length.above(0);
        expect(output).to.equal(crypto.getCiphers().join('\n') + '\n');
        done();
      });
    });
  });
  /**
   * Test specs for hashes.
   *
   * - should accept --hashes
   * - should accept -H
   */
  describe('hashes', function () {

    it('should accept --hashes', function (done) {
      let cmd = bin + ' --hashes';

      exec(cmd, { silent: true }, function (code, output) {
        expect(output).to.be.a('string');
        expect(output).to.have.length.above(0);
        expect(output).to.equal(crypto.getHashes().join('\n') + '\n');
        done();
      });
    });

    it('should accept -H', function (done) {
      let cmd = bin + ' -H';

      exec(cmd, { silent: true }, function (code, output) {
        expect(output).to.be.a('string');
        expect(output).to.have.length.above(0);
        expect(output).to.equal(crypto.getHashes().join('\n') + '\n');
        done();
      });
    });
  });
});

describe('Commands', function () {

  this.timeout(5000);

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
    fs.ensureDirSync('test/.tmp');
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
    fs.writeFileSync(files[0].name, content);
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
    fs.removeSync('test/.tmp');
  });

  /**
   * Test specs for encrypt.
   *
   * - should succeed using defaults
   * - should succeed using a custom salt
   * - should succeed using a custom number of iterations
   * - should succeed using a custom keylen
   * - should succeed using a custom digest
   * - should succeed using a custom algorithm
   */
  describe('encrypt', function () {

    it('should succeed using defaults', function (done) {
      let cmd = bin + ' encrypt' +
        ' ' + files[0].name +
        ' ' + files[1].name +
        ' -p alakazam';

      exec(cmd, { silent: true }, function (code, output) {
        expect(output).to.be.a('string');
        expect(output).to.have.length.above(0);
        expect(output).to.contain('Success');
        expect(output).to.contain(files[0].name + ' > ' + files[1].name);
        done();
      });
    });

    it('should succeed using a custom salt', function (done) {
      let cmd = bin + ' encrypt' +
        ' ' + files[0].name +
        ' ' + files[1].name +
        ' -p alakazam' +
        ' -s abracadabra';

      exec(cmd, { silent: true }, function (code, output) {
        expect(output).to.be.a('string');
        expect(output).to.have.length.above(0);
        expect(output).to.contain('Success');
        expect(output).to.contain(files[0].name + ' > ' + files[1].name);
        done();
      });
    });

    it('should succeed using a custom number of iterations', function (done) {
      let cmd = bin + ' encrypt' +
        ' ' + files[0].name +
        ' ' + files[1].name +
        ' -p alakazam' +
        ' -i 500';

      exec(cmd, { silent: true }, function (code, output) {
        expect(output).to.be.a('string');
        expect(output).to.have.length.above(0);
        expect(output).to.contain('Success');
        expect(output).to.contain(files[0].name + ' > ' + files[1].name);
        done();
      });
    });

    it('should succeed using a custom keylen', function (done) {
      let cmd = bin + ' encrypt' +
        ' ' + files[0].name +
        ' ' + files[1].name +
        ' -p alakazam' +
        ' -l 256';

      exec(cmd, { silent: true }, function (code, output) {
        expect(output).to.be.a('string');
        expect(output).to.have.length.above(0);
        expect(output).to.contain('Success');
        expect(output).to.contain(files[0].name + ' > ' + files[1].name);
        done();
      });
    });

    it('should succeed using a custom digest', function (done) {
      let cmd = bin + ' encrypt' +
        ' ' + files[0].name +
        ' ' + files[1].name +
        ' -p alakazam' +
        ' -d sha256';

      exec(cmd, { silent: true }, function (code, output) {
        expect(output).to.be.a('string');
        expect(output).to.have.length.above(0);
        expect(output).to.contain('Success');
        expect(output).to.contain(files[0].name + ' > ' + files[1].name);
        done();
      });
    });

    it('should succeed using a custom algorithm', function (done) {
      let cmd = bin + ' encrypt' +
        ' ' + files[0].name +
        ' ' + files[1].name +
        ' -p alakazam' +
        ' -a aes-128-cbc';

      exec(cmd, { silent: true }, function (code, output) {
        expect(output).to.be.a('string');
        expect(output).to.have.length.above(0);
        expect(output).to.contain('Success');
        expect(output).to.contain(files[0].name + ' > ' + files[1].name);
        done();
      });
    });
  });

  /**
   * Test specs for decrypt.
   *
   * - should succeed using defaults
   * - should succeed using a custom salt
   * - should succeed using a custom numberof iterations
   * - should succeed using a custom keylen
   * - should succeed using a custom digest
   * - should succeed using a custom algorithm
   * - should fail when using the wrong password
   * - should fail when using the wrong salt
   * - should fail when using the wrong number of iterations
   * - should fail when using the wrong keylen
   * - should fail when using the wrong digest
   * - should fail when using the wrong algorithm
   * - should fail if the input file does not exist
   */
  describe('decrypt', function () {

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

    it('should succeed using defaults', function (done) {
      let cmd = bin + ' decrypt' +
        ' ' + files[1].name +
        ' ' + files[2].name +
        ' -p alakazam';

      exec(cmd, { silent: true }, function (code, output) {
        expect(output).to.be.a('string');
        expect(output).to.have.length.above(0);
        expect(output).to.contain('Success');
        expect(output).to.contain(files[1].name + ' > ' + files[2].name);

        fs.readFile(files[2].name, 'utf8', function (err, data) {
          should.not.exist(err);
          expect(data).to.equal(content);
          done();
        });
      });
    });

    it('should succeed using a custom salt', function (done) {
      let cmd = bin + ' decrypt' +
        ' ' + files[1].name +
        ' ' + files[2].name +
        ' -p alakazam' +
        ' -s abracadabra';

      // Overwrite the encrypted file using a custom algorithm.
      nodecipher.encryptSync({
        input: files[0].name,
        output: files[1].name,
        password: 'alakazam',
        salt: 'abracadabra'
      });

      exec(cmd, { silent: true }, function (code, output) {
        expect(output).to.be.a('string');
        expect(output).to.have.length.above(0);
        expect(output).to.contain('Success');
        expect(output).to.contain(files[1].name + ' > ' + files[2].name);

        fs.readFile(files[2].name, 'utf8', function (err, data) {
          should.not.exist(err);
          expect(data).to.equal(content);
          done();
        });
      });
    });

    it('should succeed using a custom number of iterations', function (done) {
      let cmd = bin + ' decrypt' +
        ' ' + files[1].name +
        ' ' + files[2].name +
        ' -p alakazam' +
        ' -i 500';

      // Overwrite the encrypted file using a custom algorithm.
      nodecipher.encryptSync({
        input: files[0].name,
        output: files[1].name,
        password: 'alakazam',
        iterations: 500
      });

      exec(cmd, { silent: true }, function (code, output) {
        expect(output).to.be.a('string');
        expect(output).to.have.length.above(0);
        expect(output).to.contain('Success');
        expect(output).to.contain(files[1].name + ' > ' + files[2].name);

        fs.readFile(files[2].name, 'utf8', function (err, data) {
          should.not.exist(err);
          expect(data).to.equal(content);
          done();
        });
      });
    });

    it('should succeed using a custom keylen', function (done) {
      let cmd = bin + ' decrypt' +
        ' ' + files[1].name +
        ' ' + files[2].name +
        ' -p alakazam' +
        ' -l 256';

      // Overwrite the encrypted file using a custom algorithm.
      nodecipher.encryptSync({
        input: files[0].name,
        output: files[1].name,
        password: 'alakazam',
        keylen: 256
      });

      exec(cmd, { silent: true }, function (code, output) {
        expect(output).to.be.a('string');
        expect(output).to.have.length.above(0);
        expect(output).to.contain('Success');
        expect(output).to.contain(files[1].name + ' > ' + files[2].name);

        fs.readFile(files[2].name, 'utf8', function (err, data) {
          should.not.exist(err);
          expect(data).to.equal(content);
          done();
        });
      });
    });

    it('should succeed using a custom digest', function (done) {
      let cmd = bin + ' decrypt' +
        ' ' + files[1].name +
        ' ' + files[2].name +
        ' -p alakazam' +
        ' -d sha256';

      // Overwrite the encrypted file using a custom algorithm.
      nodecipher.encryptSync({
        input: files[0].name,
        output: files[1].name,
        password: 'alakazam',
        digest: 'sha256'
      });

      exec(cmd, { silent: true }, function (code, output) {
        expect(output).to.be.a('string');
        expect(output).to.have.length.above(0);
        expect(output).to.contain('Success');
        expect(output).to.contain(files[1].name + ' > ' + files[2].name);

        fs.readFile(files[2].name, 'utf8', function (err, data) {
          should.not.exist(err);
          expect(data).to.equal(content);
          done();
        });
      });
    });

    it('should succeed using a custom algorithm', function (done) {
      let cmd = bin + ' decrypt' +
        ' ' + files[1].name +
        ' ' + files[2].name +
        ' -p alakazam' +
        ' -a aes-128-cbc';

      // Overwrite the encrypted file using a custom algorithm.
      nodecipher.encryptSync({
        input: files[0].name,
        output: files[1].name,
        password: 'alakazam',
        algorithm: 'aes-128-cbc'
      });

      exec(cmd, { silent: true }, function (code, output) {
        expect(output).to.be.a('string');
        expect(output).to.have.length.above(0);
        expect(output).to.contain('Success');
        expect(output).to.contain(files[1].name + ' > ' + files[2].name);

        fs.readFile(files[2].name, 'utf8', function (err, data) {
          should.not.exist(err);
          expect(data).to.equal(content);
          done();
        });
      });
    });

    it('should fail when using the wrong password', function (done) {
      let cmd = bin + ' decrypt' +
        ' ' + files[1].name +
        ' ' + files[2].name +
        ' -p not-alakazam';

      exec(cmd, { silent: true }, function (code, output) {
        expect(output).to.be.a('string');
        expect(output).to.have.length.above(0);
        expect(output).to.contain('Bad decrypt');
        expect(output).to.contain('password');
        done();
      });
    });

    it('should fail when using the wrong salt', function (done) {
      let cmd = bin + ' decrypt' +
        ' ' + files[1].name +
        ' ' + files[2].name +
        ' -p alakazam ' +
        ' -s wrongsalt';

      exec(cmd, { silent: true }, function (code, output) {
        expect(output).to.be.a('string');
        expect(output).to.have.length.above(0);
        expect(output).to.contain('Bad decrypt');
        expect(output).to.contain('salt');
        done();
      });
    });

    it('should fail when using the wrong number of iterations', function (done) {
      let cmd = bin + ' decrypt' +
        ' ' + files[1].name +
        ' ' + files[2].name +
        ' -p alakazam ' +
        ' -i 1001';

      exec(cmd, { silent: true }, function (code, output) {
        expect(output).to.be.a('string');
        expect(output).to.have.length.above(0);
        expect(output).to.contain('Bad decrypt');
        expect(output).to.contain('iterations');
        done();
      });
    });

    it('should fail when using the wrong keylen', function (done) {
      let cmd = bin + ' decrypt' +
        ' ' + files[1].name +
        ' ' + files[2].name +
        ' -p alakazam ' +
        ' -l 256';

      exec(cmd, { silent: true }, function (code, output) {
        expect(output).to.be.a('string');
        expect(output).to.have.length.above(0);
        expect(output).to.contain('Bad decrypt');
        expect(output).to.contain('keylen');
        done();
      });
    });

    it('should fail when using the wrong digest', function (done) {
      let cmd = bin + ' decrypt' +
        ' ' + files[1].name +
        ' ' + files[2].name +
        ' -p alakazam ' +
        ' -d sha256';

      exec(cmd, { silent: true }, function (code, output) {
        expect(output).to.be.a('string');
        expect(output).to.have.length.above(0);
        expect(output).to.contain('Bad decrypt');
        expect(output).to.contain('digest');
        done();
      });
    });

    it('should fail when using the wrong algorithm', function (done) {
      let cmd = bin + ' decrypt' +
        ' ' + files[1].name +
        ' ' + files[2].name +
        ' -p alakazam ' +
        ' -a aes-128-cbc';

      exec(cmd, { silent: true }, function (code, output) {
        expect(output).to.be.a('string');
        expect(output).to.have.length.above(0);
        expect(output).to.contain('Bad decrypt');
        expect(output).to.contain('algorithm');
        done();
      });
    });

    it('should fail if the input file does not exist', function (done) {
      let cmd = bin + ' decrypt ' +
        ' ' + 'notarealfile.txt' +
        ' ' + files[2].name +
        ' -p alakazam';

      exec(cmd, { silent: true }, function (code, output) {
        expect(output).to.be.a('string');
        expect(output).to.have.length.above(0);
        expect(output).to.contain('Error');
        expect(output).to.contain('does not exist');
        done();
      });
    });
  });
});
