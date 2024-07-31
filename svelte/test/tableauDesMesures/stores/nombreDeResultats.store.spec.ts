import { describe, expect, it } from 'vitest';
import { get } from 'svelte/store';
import { rechercheParPriorite } from '../../../lib/tableauDesMesures/stores/rechercheParPriorite.store';
import { nombreResultats } from '../../../lib/tableauDesMesures/stores/nombreDeResultats.store';

describe('Le store dérivé du nombre des résultats de recherche de mesure', () => {
  describe("sur application d'un filtre de priorité", () => {
    it("indique qu'un filtre est appliqué", () => {
      rechercheParPriorite.set(['p1']);

      const { aDesFiltresAppliques } = get(nombreResultats);

      expect(aDesFiltresAppliques).toBe(true);
    });
  });
});
