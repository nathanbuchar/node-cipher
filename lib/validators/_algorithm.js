/**
 * Validate the "algorithm" option.
 *
 * @module validators/algorithm
 * @exports {Array}
 * @author Nathan Buchar
 * @since 6.1.0
 */

'use strict';

let _ = require('lodash');

let constants = require('../constants');

module.exports = function (val) {
  let errors = [];

  if (_.isUndefined(val)) {
    errors.push({
      option: 'algorithm',
      message: '"algorithm" is required.'
    });
  } else if (!_.isString(val)) {
    errors.push({
      option: 'algorithm',
      message: `"algorithm" must be a string. Got "${typeof val}"`
    });
  } else if (!_.includes(constants.ALL_CIPHERS, val)) {
    errors.push({
      option: 'algorithm',
      message: `"${val}" is not a valid cipher algorithm.`
    });
  }

  return errors;
};
