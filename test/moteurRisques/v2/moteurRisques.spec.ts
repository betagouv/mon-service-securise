import { uneDescriptionV2Valide } from '../../constructeurs/constructeurDescriptionServiceV2.ts';
import { MoteurRisquesV2 } from '../../../src/moteurRisques/v2/moteurRisques.ts';

describe('Le moteur de risques V2', () => {
  it('sélectionne les vecteurs pertinents pour le service', () => {
    const description = uneDescriptionV2Valide()
      .avecSpecificitesProjet(['postesDeTravail'])
      .construis();

    const moteur = new MoteurRisquesV2(description);

    expect(moteur.vecteurs()).toHaveLength(12);
    expect(moteur.vecteurs()).toContain('V1');
  });
});
