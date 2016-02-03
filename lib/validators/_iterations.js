/**
 * Validate the "iterations" option.
 *
 * @module validators/iterations
 * @exports {Array}
 * @author Nathan Buchar
 * @since 6.1.0
 */

'use strict';

let _ = require('lodash');

module.exports = function (val) {
  let errors = [];

  if (_.isUndefined(val)) {
    errors.push({
      option: 'iterations',
      message: '"iterations" is required.'
    });
  } if (!_.isInteger(val)) {
    errors.push({
      option: 'iterations',
      message: `"iterations" must be an integer. Got "${typeof val}"`
    });
  }

  return errors;
};
