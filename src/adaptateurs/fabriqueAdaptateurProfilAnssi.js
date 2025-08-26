import * as adaptateurEnvironnement from './adaptateurEnvironnement.js';
import * as adaptateurProfilAnssi from './adaptateurProfilAnssi.js';
import * as adaptateurProfilAnssiVide from './adaptateurProfilAnssiVide.js';

const fabriqueAdaptateurProfilAnssi = () =>
  adaptateurEnvironnement.featureFlag().avecServiceMonProfilAnssi()
    ? adaptateurProfilAnssi
    : adaptateurProfilAnssiVide;

export { fabriqueAdaptateurProfilAnssi };
