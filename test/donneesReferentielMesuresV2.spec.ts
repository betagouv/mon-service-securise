import {
  criticiteDisponibiliteEtAudienceCible,
  criticiteVolumetrieDonneesTraitees,
} from '../donneesReferentielMesuresV2.js';

describe('Le référentiel V2', () => {
  describe('sur demande de la criticité induite par des données traitées et leur volumétrie', () => {
    it('donne la criticité pour une catégorie unique', () => {
      const criticite = criticiteVolumetrieDonneesTraitees(
        'eleve',
        ['documentsIdentifiants'],
        []
      );

      expect(criticite).toBe(3);
    });

    it('donne la criticité maximale pour plusieurs catégories', () => {
      const criticite = criticiteVolumetrieDonneesTraitees(
        'eleve',
        ['documentsIdentifiants', 'secretsDEntreprise'],
        []
      );

      expect(criticite).toBe(4);
    });

    it('donne la criticité pour des données ajoutées', () => {
      const criticite = criticiteVolumetrieDonneesTraitees(
        'eleve',
        [],
        ['donneeAjoutee', 'autreDonneeAjoutee']
      );

      expect(criticite).toBe(1);
    });

    it('donne la criticité maximale pour plusieurs catégories et plusieurs données ajoutées', () => {
      const criticite = criticiteVolumetrieDonneesTraitees(
        'eleve',
        ['documentsIdentifiants', 'secretsDEntreprise'],
        ['donneeAjoutee', 'autreDonneeAjoutee']
      );

      expect(criticite).toBe(4);
    });

    it('donne une criticité minimale sans aucune donnée renseignée', () => {
      const criticite = criticiteVolumetrieDonneesTraitees('eleve', [], []);

      expect(criticite).toBe(1);
    });
  });

  describe("sur demande de la criticité induite par l'audience cible du service et la disponibilité du service", () => {
    it('retourne le niveau calculé', () => {
      const criticite = criticiteDisponibiliteEtAudienceCible(
        'moinsDe4h',
        'large'
      );

      expect(criticite).toBe(4);
    });
  });
});
