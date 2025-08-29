import * as adaptateurProfilAnssi from './adaptateurProfilAnssi.js';
import { fabriqueAdaptateurProfilAnssiVide } from './adaptateurProfilAnssiVide.js';
import { featureFlag } from './adaptateurEnvironnement.js';

export const fabriqueAdaptateurProfilAnssi = () =>
  featureFlag().avecServiceMonProfilAnssi()
    ? adaptateurProfilAnssi
    : fabriqueAdaptateurProfilAnssiVide();
