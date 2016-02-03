/**
 * Validate the "keylen" option.
 *
 * @module validators/keylen
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
      option: 'keylen',
      message: '"keylen" is required.'
    });
  } if (!_.isInteger(val)) {
    errors.push({
      option: 'keylen',
      message: `"keylen" must be an integer. Got "${typeof val}"`
    });
  }

  return errors;
};
