const adaptateurSupervision = require('./adaptateurSupervision');
const {
  fabriqueAdaptateurChiffrement,
} = require('./fabriqueAdaptateurChiffrement');

const fabriqueAdaptateurSupervision = () =>
  adaptateurSupervision({
    adaptateurChiffrement: fabriqueAdaptateurChiffrement(),
  });

module.exports = fabriqueAdaptateurSupervision;
