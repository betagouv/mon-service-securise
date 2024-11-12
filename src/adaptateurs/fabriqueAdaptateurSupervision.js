const adaptateurSupervision = require('./adaptateurSupervision');
const adaptateurEnvironnement = require('./adaptateurEnvironnement');
const {
  fabriqueAdaptateurChiffrement,
} = require('./fabriqueAdaptateurChiffrement');

const fabriqueAdaptateurSupervision = () =>
  adaptateurSupervision({
    adaptateurChiffrement: fabriqueAdaptateurChiffrement(),
    adaptateurEnvironnement,
  });

module.exports = fabriqueAdaptateurSupervision;
