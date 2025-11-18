import { ExplicationNouveauReferentiel } from '../../src/modeles/explicationNouveauReferentiel.js';

describe('Le modèle explicationNouveauReferentiel', () => {
  it('peut être finalisé', () => {
    const explicationNouveauReferentiel = new ExplicationNouveauReferentiel({
      dejaTermine: false,
    });

    explicationNouveauReferentiel.finalise();

    expect(explicationNouveauReferentiel.estTermine()).toBe(true);
  });

  it('se convertit en JSON', () => {
    const explicationNouveauReferentiel = new ExplicationNouveauReferentiel({
      dejaTermine: false,
    });

    const json = explicationNouveauReferentiel.toJSON();

    expect(json).toEqual({ dejaTermine: false });
  });

  it("sait si les explications doivent être affichées à l'utilisateur", () => {
    const explicationNouveauReferentiel = new ExplicationNouveauReferentiel({
      dejaTermine: false,
    });

    expect(explicationNouveauReferentiel.doitEtreAffichee()).toBe(true);
  });
});
