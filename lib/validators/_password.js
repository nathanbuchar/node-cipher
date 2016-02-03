/**
 * Validate the "password" option.
 *
 * @module validators/password
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
      option: 'password',
      message: '"password" is required.'
    });
  } if (!_.isString(val)) {
    errors.push({
      option: 'password',
      message: `"password" must be a string. Got "${typeof val}"`
    });
  }

  return errors;
};
