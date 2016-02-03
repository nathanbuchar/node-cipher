/**
 * Validate the "salt" option.
 *
 * @module validators/salt
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
      option: 'salt',
      message: '"salt" is required.'
    });
  } if (!_.isString(val) && !Buffer.isBuffer(val)) {
    errors.push({
      option: 'salt',
      message: `"salt" must be a string or buffer. Got "${typeof val}"`
    });
  }

  return errors;
};
