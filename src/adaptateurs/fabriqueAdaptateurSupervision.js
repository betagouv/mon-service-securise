import adaptateurSupervisionMetabase from './adaptateurSupervisionMetabase.js';
import * as adaptateurEnvironnement from './adaptateurEnvironnement.js';
import { fabriqueAdaptateurChiffrement } from './fabriqueAdaptateurChiffrement.js';

const fabriqueAdaptateurSupervision = () =>
  adaptateurSupervisionMetabase({
    adaptateurChiffrement: fabriqueAdaptateurChiffrement(),
    adaptateurEnvironnement,
  });

export default fabriqueAdaptateurSupervision;
