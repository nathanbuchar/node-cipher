#!/usr/bin/env node

var nodecipher = require('../');

module.exports = function (yargs) {
  console.log(nodecipher.list().join(', '));
};
