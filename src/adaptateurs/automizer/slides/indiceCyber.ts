import { Automizer, modify } from 'pptx-automizer';
import { MODELE, SLIDE_INDICE_CYBER } from '../template.js';
import { IndiceCyberDuService } from '../../../modeles/objetsPowerpoint/indiceCyber.js';

const auDixieme = new Intl.NumberFormat('fr', {
  minimumFractionDigits: 1,
  maximumFractionDigits: 1,
}).format;

export const ajouteLIndiceCyber = (
  presentation: Automizer,
  indiceCyber: IndiceCyberDuService
) => {
  presentation.addSlide(MODELE, SLIDE_INDICE_CYBER, (slide) => {
    slide.modifyElement(
      'indice-cyber-texte',
      modify.replaceText([
        { replace: 'nomService', by: { text: indiceCyber.nomService } },
        { replace: 'indiceCyber', by: { text: auDixieme(indiceCyber.total) } },
        {
          replace: 'indiceCyberPersonnalise',
          by: { text: auDixieme(indiceCyber.totalPersonnalise) },
        },
      ])
    );
    ['indice-cyber-referentiels', 'indice-cyber-explication'].forEach((forme) =>
      slide.modifyElement(
        forme,
        modify.replaceText({
          replace: 'referentiels',
          by: { text: indiceCyber.referentiels },
        })
      )
    );
  });
};
