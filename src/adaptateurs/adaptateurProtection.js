const { csrf } = require('lusca');

const adaptateurProtection = {
  protectionCsrf: (pointsEntreesSansProtection) =>
    csrf({ blocklist: pointsEntreesSansProtection }),
};

module.exports = { adaptateurProtection };
