const merge = require('lodash.merge');

const fusionneJSON = (a, b) => merge({}, a, b);

module.exports = { fusionneJSON };
