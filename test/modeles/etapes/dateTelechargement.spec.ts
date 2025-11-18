import DateTelechargement from '../../../src/modeles/etapes/dateTelechargement.js';

describe("La date de téléchargement des documents d'homologation", () => {
  it('sait se convertir en JSON', () => {
    const dateTelechargement = new DateTelechargement({
      date: '2023-02-02T00:00:00.000Z',
    });

    expect(dateTelechargement.toJSON()).toEqual({
      date: '2023-02-02T00:00:00.000Z',
    });
  });

  describe("sur vérification qu'elle est complète", () => {
    it("retourne `false` s'il n'y a pas de date de téléchargement", () => {
      const sansTelechargementDecision = new DateTelechargement();
      expect(sansTelechargementDecision.estComplete()).toBe(false);
    });

    it("retourne `true` s'il y a une date de téléchargement", () => {
      const dateTelechargement = new DateTelechargement({
        date: '2023-02-02T00:00:00.000Z',
      });
      expect(dateTelechargement.estComplete()).toBe(true);
    });
  });

  it('sait enregistrer une date de téléchargement', () => {
    const sansTelechargementDecision = new DateTelechargement();
    const date = '2023-02-02T00:00:00.000Z';
    sansTelechargementDecision.enregistreDateTelechargement(
      '2023-02-02T00:00:00.000Z'
    );
    expect(sansTelechargementDecision.date).toBe(date);
  });
});
