import { beforeEach } from 'vitest';
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

  describe('concernant les risques', () => {
    let moteurAvecMesuresFaites: MoteurRisquesV2;

    beforeEach(() => {
      const referentiel = creeReferentielV2();
      const mesureFaite = (id: IdMesureV2) => ({
        [id]: new MesureGenerale({ statut: 'fait', id }, referentiel),
      });
      const mesureNonFaite = (id: IdMesureV2) => ({
        [id]: new MesureGenerale({ statut: '', id }, referentiel),
      });

      moteurAvecMesuresFaites = new MoteurRisquesV2(
        // Un service dont le premier risque est "R3"
        uneDescriptionDeNiveauDeSecuriteEstime1()
          .avecNiveauSecurite('niveau1')
          .construis(),
        {
          // La mesure du groupe "g" qui fait baisser la vraisemblance de 1
          ...mesureFaite('CONTRAT.1'),
          // Les mesures du groupe "a"
          ...mesureNonFaite('MCO_MCS.5'),
          ...mesureNonFaite('MCO_MCS.6'),
          ...mesureNonFaite('MCO_MCS.14'),
        }
      );
    });

    it('sait donner les risques résiduels pour le service', () => {
      const residuels = moteurAvecMesuresFaites.risques();

      expect(residuels).toBeInstanceOf(Array<RisqueV2>);
      expect(residuels[0].vraisemblance).toBe(3);
    });

    it("sait donner les risques bruts : comme si le service n'avait fait aucune mesure", () => {
      const bruts = moteurAvecMesuresFaites.risquesBruts();

      expect(bruts).toBeInstanceOf(Array<RisqueV2>);
      expect(bruts[0].vraisemblance).toBe(4);
    });

    it('sait donner les risques cibles : comme si le service avait fait toutes ses mesures', () => {
      const cibles = moteurAvecMesuresFaites.risquesCibles();

      expect(cibles).toBeInstanceOf(Array<RisqueV2>);
      expect(cibles[0].vraisemblance).toBe(1);
    });

    it('peut calculer les 3 types de risques sans interférences les uns avec les autres (pas de mutation)', () => {
      const bruts = moteurAvecMesuresFaites.risquesBruts();
      const cibles = moteurAvecMesuresFaites.risquesCibles();
      const residuels = moteurAvecMesuresFaites.risques();

      expect(bruts[0].vraisemblance).toBe(4);
      expect(cibles[0].vraisemblance).toBe(1);
      expect(residuels[0].vraisemblance).toBe(3);
    });
  });
});
