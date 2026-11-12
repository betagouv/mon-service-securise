import { besoinsDeSecurite } from '../../../src/modeles/objetsPowerpoint/besoinsDeSecurite.js';
import { uneDescriptionV2Valide } from '../../constructeurs/constructeurDescriptionServiceV2.js';

describe('Les besoins de sécurité présentés à la commission', () => {
  it('nomment le niveau de besoin de sécurité du service', () => {
    const description = uneDescriptionV2Valide()
      .avecNiveauSecurite('niveau2')
      .construis();

    expect(besoinsDeSecurite(description).niveau).toBe('Modérés');
  });
});
