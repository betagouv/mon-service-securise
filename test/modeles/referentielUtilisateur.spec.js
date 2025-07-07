const expect = require('expect.js');
const ReferentielUtilisateur = require('../../src/modeles/referentielUtilisateur');
const {
  ErreurModeleMesureSpecifiqueIntrouvable,
} = require('../../src/erreurs');

describe('Un référentiel utilisateur', () => {
  describe('sur demande de toutes les mesures spécifiques', () => {
    it('sait reconstruire un mesure spécifique avec les données de modèle', () => {
      const referentielUtilisateur = new ReferentielUtilisateur({
        modelesMesuresSpecifiques: {
          MS1: {
            description: 'une mesure spécifique',
            categorie: 'gouvernance',
          },
        },
      });

      const mesuresSpecifiques =
        referentielUtilisateur.toutesMesuresSpecifiques([
          { idModele: 'MS1', statut: 'fait' },
        ]);

      expect(mesuresSpecifiques[0]).to.eql({
        categorie: 'gouvernance',
        description: 'une mesure spécifique',
        idModele: 'MS1',
        statut: 'fait',
      });
    });

    it('aggrège ces mesures reconstruite avec des mesures spécifiques', () => {
      const referentielUtilisateur = new ReferentielUtilisateur({
        modelesMesuresSpecifiques: {
          MS1: {},
        },
      });

      const mesuresSpecifiques =
        referentielUtilisateur.toutesMesuresSpecifiques([
          { idModele: 'MS1', statut: 'fait' },
          { statut: 'enCours' },
        ]);

      expect(mesuresSpecifiques.length).to.be(2);
      expect(mesuresSpecifiques[0].statut).to.be('fait');
      expect(mesuresSpecifiques[1].statut).to.be('enCours');
    });

    it('jette une erreur si un identifiant de modèle est introuvable', () => {
      const referentielUtilisateur = new ReferentielUtilisateur({
        modelesMesuresSpecifiques: {},
      });

      expect(() =>
        referentielUtilisateur.toutesMesuresSpecifiques([
          {
            idModele: 'MS1',
            statut: 'fait',
          },
        ])
      ).to.throwError((e) => {
        expect(e).to.be.an(ErreurModeleMesureSpecifiqueIntrouvable);
        expect(e.message).to.be(
          "Le modèle 'MS1' de la mesure spécifique est introuvable"
        );
      });
    });
  });
});
