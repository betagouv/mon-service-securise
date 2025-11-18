import { ExplicationNouveauReferentiel } from '../../src/modeles/explicationNouveauReferentiel.js';
import { VersionService } from '../../src/modeles/versionService.js';

describe('Le modèle explicationNouveauReferentiel', () => {
  const donneesValides = {
    dejaTermine: false,
    versionsService: [VersionService.v1, VersionService.v2],
  };

  it('peut être finalisé', () => {
    const explicationNouveauReferentiel = new ExplicationNouveauReferentiel(
      donneesValides
    );

    explicationNouveauReferentiel.finalise();

    expect(explicationNouveauReferentiel.estTermine()).toBe(true);
  });

  it('se convertit en JSON', () => {
    const explicationNouveauReferentiel = new ExplicationNouveauReferentiel(
      donneesValides
    );

    const json = explicationNouveauReferentiel.toJSON();

    expect(json).toEqual({ dejaTermine: false });
  });

  describe("concernant la nécessité d'afficher l'explication à l'utilisateur", () => {
    it("l'affiche quand les conditions sont réunies", () => {
      const explicationNouveauReferentiel = new ExplicationNouveauReferentiel(
        donneesValides
      );

      expect(explicationNouveauReferentiel.doitEtreAffichee()).toBe(true);
    });

    it("ne l'affiche pas si l'utilisateur n'a pas de service v1", () => {
      const explicationNouveauReferentiel = new ExplicationNouveauReferentiel({
        dejaTermine: false,
        versionsService: [VersionService.v2],
      });

      expect(explicationNouveauReferentiel.doitEtreAffichee()).toBe(false);
    });
  });
});
