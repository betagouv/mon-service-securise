import * as adaptateurEnvironnement from './adaptateurEnvironnement.js';
import { adaptateurChiffrementChaCha20 } from './adaptateurChiffrementChaCha20.js';
import { adaptateurChiffrement } from './adaptateurChiffrement.js';

const fabriqueAdaptateurChiffrement = () => {
  if (adaptateurEnvironnement.chiffrement().utiliseChiffrementChaCha20())
    return adaptateurChiffrementChaCha20({ adaptateurEnvironnement });

  return adaptateurChiffrement({ adaptateurEnvironnement });
};
export { fabriqueAdaptateurChiffrement };
