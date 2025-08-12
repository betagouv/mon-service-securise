const expect = require('expect.js');
const TeleversementModelesMesureSpecifique = require('../../../src/modeles/televersement/televersementModelesMesureSpecifique');
const Referentiel = require('../../../src/referentiel');

describe('Un téléversement de modèles de mesure spécifique', () => {
  let referentiel;

  beforeEach(() => {
    referentiel = Referentiel.creeReferentiel({
      categoriesMesures: { gouvernance: 'Gouvernance' },
    });
  });

  const unTeleversement = (donnees) =>
    new TeleversementModelesMesureSpecifique(donnees, referentiel);

  describe('sur demande de rapport détaillé', () => {
    it('met dans chaque ligne du rapport le modèle concerné', () => {
      const rapport = unTeleversement([
        { description: 'D1', categorie: 'Gouvernance' },
        { description: 'D2', categorie: 'Gouvernance' },
      ]).rapportDetaille();

      expect(rapport.modelesTeleverses.length).to.be(2);
      const [d1, d2] = rapport.modelesTeleverses;
      expect(d1.modele.description).to.be('D1');
      expect(d2.modele.description).to.be('D2');
    });

    it('sait détecter une erreur de description manquante (colonne Intitulé dans le Excel)', () => {
      const sansDescription = {
        description: '',
        descriptionLongue: '',
        categorie: 'Gouvernance',
      };

      const rapport = unTeleversement([sansDescription]).rapportDetaille();

      expect(rapport.modelesTeleverses[0].erreurs).to.eql([
        'INTITULE_MANQUANT',
      ]);
    });

    it('sait détecter une erreur de catégorie inconnue du référentiel', () => {
      const categorieZ = {
        categorie: 'Z',
        description: 'D…',
        descriptionLongue: '',
      };

      const rapport = unTeleversement([categorieZ]).rapportDetaille();

      expect(rapport.modelesTeleverses[0].erreurs).to.eql([
        'CATEGORIE_INCONNUE',
      ]);
    });

    it('indique une erreur de catégorie inconnue en cas de catégorie manquante', () => {
      const sansCategorie = {
        categorie: '',
        description: 'D…',
        descriptionLongue: '',
      };

      const rapport = unTeleversement([sansCategorie]).rapportDetaille();

      expect(rapport.modelesTeleverses[0].erreurs).to.eql([
        'CATEGORIE_INCONNUE',
      ]);
    });

    it('attribue un numéro à chaque ligne, en commençant à 1', () => {
      const rapport = unTeleversement([
        { description: 'D1', categorie: 'Gouvernance' },
        { description: 'D2', categorie: 'Gouvernance' },
      ]).rapportDetaille();

      const [a, b] = rapport.modelesTeleverses;
      expect(a.numeroLigne).to.be(1);
      expect(a.modele.description).to.be('D1');
      expect(b.numeroLigne).to.be(2);
      expect(b.modele.description).to.be('D2');
    });
  });
});
