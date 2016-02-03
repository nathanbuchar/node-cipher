/**
 * Validate the "input" option.
 *
 * @module validators/input
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
      option: 'input',
      message: '"input" is required.'
    });
  } if (!_.isString(val)) {
    errors.push({
      option: 'input',
      message: `"input" must be a string. Got "${typeof val}"`
    });
  }

  return errors;
};
