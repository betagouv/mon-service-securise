import { besoinsDeSecurite } from '../../../src/modeles/objetsPowerpoint/besoinsDeSecurite.js';
import { uneDescriptionV2Valide } from '../../constructeurs/constructeurDescriptionServiceV2.js';

describe('Les besoins de sécurité présentés à la commission', () => {
  it('nomment le niveau de besoin de sécurité du service', () => {
    const description = uneDescriptionV2Valide()
      .avecNiveauSecurite('niveau2')
      .construis();

    expect(besoinsDeSecurite(description).niveau).toBe('Modérés');
  });

  it('résument le niveau de besoin de sécurité', () => {
    const description = uneDescriptionV2Valide()
      .avecNiveauSecurite('niveau1')
      .construis();

    expect(besoinsDeSecurite(description).resume).toBe(
      "Les besoins de sécurité sont basiques en l'absence de données ou de fonctionnalités sensibles."
    );
  });
});
