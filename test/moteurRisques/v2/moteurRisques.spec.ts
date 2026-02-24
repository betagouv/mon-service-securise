import {
  uneDescriptionDeNiveauDeSecuriteEstime1,
  uneDescriptionV2Valide,
} from '../../constructeurs/constructeurDescriptionServiceV2.ts';
import { MoteurRisquesV2 } from '../../../src/moteurRisques/v2/moteurRisques.ts';
import { RisqueV2 } from '../../../src/moteurRisques/v2/risqueV2.ts';
import MesureGenerale from '../../../src/modeles/mesureGenerale.js';
import { creeReferentielV2 } from '../../../src/referentielV2.ts';
import { IdMesureV2 } from '../../../donneesReferentielMesuresV2.ts';

describe('Le moteur de risques V2', () => {
  const uneAPISimple = () =>
    uneDescriptionV2Valide()
      .avecTypesService(['api'])
      .avecSpecificitesProjet([])
      .avecVolumeDonneesTraitees('moyen')
      .avecDureeDysfonctionnementAcceptable('moinsDe4h')
      .construis();

  it('sélectionne les vecteurs pertinents pour le service', () => {
    const description = uneDescriptionV2Valide()
      .avecSpecificitesProjet(['postesDeTravail'])
      .construis();

    const moteur = new MoteurRisquesV2(description, {});

    expect(moteur.vecteurs()).toHaveLength(12);
    expect(moteur.vecteurs()).toContain('V1');
  });

  it('sélectionne les objectifs visés pertinents pour le service', () => {
    const moteur = new MoteurRisquesV2(uneAPISimple(), {});

    expect(moteur.objectifsVises()).toEqual({
      OV2: 2,
      OV3: 4,
    });
  });

  it('sait donner les risques pour le service (en utilisant les vecteurs et objectifs visés pertinents)', () => {
    const referentiel = creeReferentielV2();
    const mesureFaite = (id: IdMesureV2) => ({
      [id]: new MesureGenerale({ statut: 'fait', id }, referentiel),
    });

    const moteur = new MoteurRisquesV2(
      // Un service dont le premier risque est "R3"
      uneDescriptionDeNiveauDeSecuriteEstime1()
        .avecNiveauSecurite('niveau1')
        .construis(),
      {
        // La mesure du groupe "g" qui fait baisser la vraisemblance de 1
        ...mesureFaite('CONTRAT.1'),
        // Les mesures du groupe "a" qui font baisser la vraisemblance de 2
        ...mesureFaite('MCO_MCS.14'),
        ...mesureFaite('MCO_MCS.5'),
        ...mesureFaite('MCO_MCS.6'),
      }
    );

    const risques = moteur.risques();

    expect(risques).toBeInstanceOf(Array<RisqueV2>);
    expect(risques[0].vraisemblance).toBe(1);
  });
});
