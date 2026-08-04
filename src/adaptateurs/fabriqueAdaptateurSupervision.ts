import adaptateurSupervisionMetabase from './adaptateurSupervisionMetabase.js';
import { fabriqueAdaptateurChiffrement } from './fabriqueAdaptateurChiffrement.js';

const fabriqueAdaptateurSupervision = () =>
  adaptateurSupervisionMetabase({
    adaptateurChiffrement: fabriqueAdaptateurChiffrement(),
  });

export default fabriqueAdaptateurSupervision;
