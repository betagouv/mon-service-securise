import { describe, expect, it } from 'vitest';
import { get } from 'svelte/store';
import { resultatsDeRecherche } from '../../../lib/tableauDesMesures/stores/resultatsDeRecherche.store';
import { mesures } from '../../../lib/tableauDesMesures/stores/mesures.store';
import { rechercheParPriorite } from '../../../lib/tableauDesMesures/stores/rechercheParPriorite.store';
import { Referentiel } from '../../../lib/ui/types.d';

describe('Le store dérivé des résultats de recherche de mesure', () => {
  describe("sur application d'un filtre de priorité", () => {
    it('conserve uniquement les mesures correspondantes', () => {
      mesures.reinitialise({
        mesuresGenerales: {
          uneMesure: {
            categorie: 'Protection',
            indispensable: true,
            descriptionLongue: '',
            referentiel: Referentiel.ANSSI,
            description: '',
            identifiantNumerique: '000',
            priorite: 'p1',
          },
        },
        mesuresSpecifiques: [],
      });
      rechercheParPriorite.set(['p2']);

      const { mesuresGenerales } = get(resultatsDeRecherche);

      expect(Object.keys(mesuresGenerales).length).toBe(0);
    });
  });
});
