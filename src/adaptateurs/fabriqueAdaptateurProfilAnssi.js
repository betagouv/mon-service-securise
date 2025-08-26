import * as adaptateurProfilAnssi from './adaptateurProfilAnssi.js';
import adaptateurProfilAnssiVide from './adaptateurProfilAnssiVide.js';
import { featureFlag } from './adaptateurEnvironnement.js';

const fabriqueAdaptateurProfilAnssi = () =>
  featureFlag().avecServiceMonProfilAnssi()
    ? adaptateurProfilAnssi
    : adaptateurProfilAnssiVide;

export default { fabriqueAdaptateurProfilAnssi };
