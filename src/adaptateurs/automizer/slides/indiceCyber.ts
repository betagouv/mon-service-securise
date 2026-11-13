import { Automizer, modify } from 'pptx-automizer';
import { MODELE, SLIDE_INDICE_CYBER } from '../template.js';
import { IndiceCyberDuService } from '../../../modeles/objetsPowerpoint/indiceCyber.js';
import {
  svgIndiceCyber,
  svgIndiceCyberPersonnalise,
} from '../../indiceCyberSvg.js';
import { svgEnPng } from '../svgEnPng.js';
import { pointeLImageSur } from '../formes.js';
import { auDixieme } from '../texte.js';
import { svgRadarIndiceCyber } from '../radarIndiceCyberSvg.js';

export const LARGEUR_DES_JAUGES = 420;
export const LARGEUR_DU_RADAR = 2048;
const JAUGE = 'jaugeIndiceCyber.png';
const JAUGE_PERSONNALISEE = 'jaugeIndiceCyberPersonnalise.png';
const RADAR = 'radarIndiceCyber.png';

export const imagesDeLIndiceCyber = (
  indiceCyber: IndiceCyberDuService
): { noms: string[]; images: Buffer<ArrayBufferLike>[] } => {
  const { noteMax, totalPersonnalise, total, categories } = indiceCyber;
  return {
    noms: [JAUGE, JAUGE_PERSONNALISEE, RADAR],
    images: [
      svgEnPng(svgIndiceCyber(total, noteMax), LARGEUR_DES_JAUGES),
      svgEnPng(
        svgIndiceCyberPersonnalise(totalPersonnalise, noteMax),
        LARGEUR_DES_JAUGES
      ),
      svgEnPng(svgRadarIndiceCyber(categories, noteMax), LARGEUR_DU_RADAR),
    ],
  };
};

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
    slide.modifyElement('indice-cyber-jauge', pointeLImageSur(JAUGE));
    slide.modifyElement(
      'indice-cyber-jauge-personnalisee',
      pointeLImageSur(JAUGE_PERSONNALISEE)
    );
    slide.modifyElement('indice-cyber-radar', pointeLImageSur(RADAR));
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
