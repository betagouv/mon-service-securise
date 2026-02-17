import MesureGenerale from '../../../src/modeles/mesureGenerale.js';
import { creeReferentielV2 } from '../../../src/referentielV2.ts';
import {
  siAucune,
  siPasTout,
  siTout,
} from '../../../src/moteurRisques/v2/vraisemblance/vraisemblance.predicats.ts';
import { ReferentielV2 } from '../../../src/referentiel.interface.ts';

describe('Les prédicats de calculs de vraisemblance', () => {
  let referentiel: ReferentielV2;

  beforeEach(() => {
    referentiel = creeReferentielV2();
  });

  describe("pour le prédicat 'siTout'", () => {
    it('retourne `1` si toutes les mesures sont faites', () => {
      const mesures = [
        new MesureGenerale(
          { statut: 'fait', id: 'RECENSEMENT.1' },
          referentiel
        ),
        new MesureGenerale(
          { statut: 'fait', id: 'RECENSEMENT.2' },
          referentiel
        ),
      ];

      expect(siTout(mesures)).toBe(1);
    });

    it("retourne `0` si une des mesures n'est pas faite", () => {
      const mesures = [
        new MesureGenerale(
          { statut: 'fait', id: 'RECENSEMENT.1' },
          referentiel
        ),
        new MesureGenerale({ id: 'RECENSEMENT.2' }, referentiel),
      ];

      expect(siTout(mesures)).toBe(0);
    });
  });

  describe("pour le prédicat 'siAucune'", () => {
    it("retourne `1` si aucune mesure n'est faite", () => {
      const mesures = [
        new MesureGenerale({ id: 'RECENSEMENT.1' }, referentiel),
        new MesureGenerale(
          { statut: 'enCours', id: 'RECENSEMENT.2' },
          referentiel
        ),
      ];

      expect(siAucune(mesures)).toBe(1);
    });

    it('retourne `0` si une des mesures est faite', () => {
      const mesures = [
        new MesureGenerale(
          { statut: 'fait', id: 'RECENSEMENT.1' },
          referentiel
        ),
        new MesureGenerale({ id: 'RECENSEMENT.2' }, referentiel),
      ];

      expect(siAucune(mesures)).toBe(0);
    });
  });

  describe("pour le prédicat 'siPasTout'", () => {
    it("retourne `1` si au moins une mesure n'est pas faite", () => {
      const mesures = [
        new MesureGenerale({ id: 'RECENSEMENT.1' }, referentiel),
        new MesureGenerale(
          { statut: 'fait', id: 'RECENSEMENT.2' },
          referentiel
        ),
      ];

      expect(siPasTout(mesures)).toBe(1);
    });

    it('retourne `0` si toutes les mesures sont faites', () => {
      const mesures = [
        new MesureGenerale(
          { statut: 'fait', id: 'RECENSEMENT.1' },
          referentiel
        ),
        new MesureGenerale(
          { statut: 'fait', id: 'RECENSEMENT.2' },
          referentiel
        ),
      ];

      expect(siPasTout(mesures)).toBe(0);
    });
  });
});
