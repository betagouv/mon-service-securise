import { Automizer, ISlide, modify } from 'pptx-automizer';
import { MODELE, SLIDE_MEMBRES_COMMISSION } from '../template.js';
import { AutoriteHomologation } from '../../adaptateurPowerpoint.interface.js';

const FORMES_AUTORITE_A_COMPLETER = [
  'autorite-homologation-a-completer-fond',
  'autorite-homologation-a-completer-trait',
  'autorite-homologation-a-completer-texte',
];

const remplisCelluleAutoriteRenseignee = (
  slide: ISlide,
  autorite: AutoriteHomologation
) => {
  slide.modifyElement(
    'autorite-homologation',
    modify.setText(`${autorite.nom}, ${autorite.fonction}`)
  );
};

const retireCelluleAutoriteRenseignee = (slide: ISlide) => {
  slide.removeElement('autorite-homologation');
};

const retireCelluleAutoriteACompleter = (slide: ISlide) => {
  FORMES_AUTORITE_A_COMPLETER.forEach((forme) => slide.removeElement(forme));
};

const ecrisAutoriteHomologation = (
  slide: ISlide,
  autorite: AutoriteHomologation | undefined
) => {
  if (autorite) {
    remplisCelluleAutoriteRenseignee(slide, autorite);
    retireCelluleAutoriteACompleter(slide);
  } else {
    retireCelluleAutoriteRenseignee(slide);
  }
};

export const ajouteLaCompositionDeLaCommission = (
  presentation: Automizer,
  autorite: AutoriteHomologation | undefined
) => {
  presentation.addSlide(MODELE, SLIDE_MEMBRES_COMMISSION, (slide) => {
    ecrisAutoriteHomologation(slide, autorite);
  });
};
