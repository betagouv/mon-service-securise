const expect = require('expect.js');
const TeleversementModelesMesureSpecifique = require('../../../src/modeles/televersement/televersementModelesMesureSpecifique');

describe('Un téléversement de modèles de mesure spécifique', () => {
  const unTeleversement = (donnees) =>
    new TeleversementModelesMesureSpecifique(donnees);

  describe('sur demande de rapport détaillé', () => {
    it('met dans chaque ligne du rapport le modèle concerné', () => {
      const rapport = unTeleversement([
        { description: 'D1', categorie: 'gouvernance' },
        { description: 'D2', categorie: 'gouvernance' },
      ]).rapportDetaille();

      expect(rapport.modelesTeleverses.length).to.be(2);
      const [d1, d2] = rapport.modelesTeleverses;
      expect(d1.modele.description).to.be('D1');
      expect(d2.modele.description).to.be('D2');
    });

    it('sait détecter une erreur de description manquante (colonne Intitulé dans le Excel)', () => {
      const sansDescription = {
        description: '  ',
        modalites: '',
        categorie: 'gouvernance',
      };

      const rapport = unTeleversement([sansDescription]).rapportDetaille();

      expect(rapport.modelesTeleverses[0].erreurs).to.eql([
        'INTITULE_MANQUANT',
      ]);
    });

    it('sait détecter une erreur de catégorie manquante', () => {
      const sansCategorie = {
        categorie: '',
        description: 'D1',
        modalites: '',
      };

      const rapport = unTeleversement([sansCategorie]).rapportDetaille();

      expect(rapport.modelesTeleverses[0].erreurs).to.eql([
        'CATEGORIE_MANQUANTE',
      ]);
    });
  });
});
