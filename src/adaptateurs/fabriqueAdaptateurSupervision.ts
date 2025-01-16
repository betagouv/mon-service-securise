const adaptateurSupervisionMetabase = require('./adaptateurSupervisionMetabase');
const adaptateurEnvironnement = require('./adaptateurEnvironnement');
const {
  fabriqueAdaptateurChiffrement,
} = require('./fabriqueAdaptateurChiffrement');

const fabriqueAdaptateurSupervision = () =>
  adaptateurSupervisionMetabase({
    adaptateurChiffrement: fabriqueAdaptateurChiffrement(),
    adaptateurEnvironnement,
  });

module.exports = fabriqueAdaptateurSupervision;
