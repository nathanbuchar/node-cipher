/**
 * Validate the "output" option.
 *
 * @module validators/output
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
      option: 'output',
      message: '"output" is required.'
    });
  } if (!_.isString(val)) {
    errors.push({
      option: 'output',
      message: `"output" must be a string. Got "${typeof val}"`
    });
  }

  return errors;
};
