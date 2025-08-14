const expect = require('expect.js');
const TeleversementModelesMesureSpecifique = require('../../../src/modeles/televersement/televersementModelesMesureSpecifique');
const Referentiel = require('../../../src/referentiel');

describe('Un téléversement de modèles de mesure spécifique', () => {
  let referentiel;

  beforeEach(() => {
    referentiel = Referentiel.creeReferentiel({
      categoriesMesures: { gouvernance: 'Gouvernance' },
      modelesMesureSpecifique: {
        nombreMaximumParUtilisateur: 40,
      },
    });
  });

  const unTeleversement = (donnees) =>
    new TeleversementModelesMesureSpecifique(donnees, referentiel);

  describe('sur demande de rapport détaillé', () => {
    it('met dans chaque ligne du rapport le modèle concerné', () => {
      const rapport = unTeleversement([
        { description: 'D1', categorie: 'Gouvernance' },
        { description: 'D2', categorie: 'Gouvernance' },
      ]).rapportDetaille({});

      expect(rapport.modelesTeleverses.length).to.be(2);
      const [d1, d2] = rapport.modelesTeleverses;
      expect(d1.modele.description).to.be('D1');
      expect(d2.modele.description).to.be('D2');
    });

    it('sait détecter une erreur de nom de mesure dupliqué', () => {
      const dupliquee = {
        description: 'M1 qui existe déjà',
        categorie: 'Gouvernance',
      };

      const rapportAvecDuplicata = unTeleversement([
        structuredClone(dupliquee),
        structuredClone(dupliquee),
      ]).rapportDetaille({});

      const [d1, d2] = rapportAvecDuplicata.modelesTeleverses;
      expect(d1.erreurs).to.eql(['MESURE_DUPLIQUEE']);
      expect(d2.erreurs).to.eql(['MESURE_DUPLIQUEE']);
    });

    it('sait détecter une erreur de description manquante (colonne Intitulé dans le Excel)', () => {
      const sansDescription = {
        description: '',
        descriptionLongue: '',
        categorie: 'Gouvernance',
      };

      const rapport = unTeleversement([sansDescription]).rapportDetaille({});

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

      const rapport = unTeleversement([categorieZ]).rapportDetaille({});

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

      const rapport = unTeleversement([sansCategorie]).rapportDetaille({});

      expect(rapport.modelesTeleverses[0].erreurs).to.eql([
        'CATEGORIE_INCONNUE',
      ]);
    });

    it('sait détecter une erreur de dépassement du nombre maximum de modèles', () => {
      referentiel.nombreMaximumDeModelesMesureSpecifiqueParUtilisateur = () =>
        5;
      const rajouteDeuxMesures = [
        { description: 'D1', categorie: 'Gouvernance' },
        { description: 'D2', categorie: 'Gouvernance' },
      ];

      const rapport = unTeleversement(rajouteDeuxMesures).rapportDetaille({
        nbActuelModelesMesureSpecifique: 4,
      });

      expect(rapport.depassementDuNombreMaximum).to.eql({
        nombreMaximum: 5,
        nombreSiAccepte: 4 + 2,
      });
      expect(rapport.statut).to.be('INVALIDE');
    });

    it('attribue un numéro à chaque ligne, en commençant à 1', () => {
      const rapport = unTeleversement([
        { description: 'D1', categorie: 'Gouvernance' },
        { description: 'D2', categorie: 'Gouvernance' },
      ]).rapportDetaille({});

      const [a, b] = rapport.modelesTeleverses;
      expect(a.numeroLigne).to.be(1);
      expect(a.modele.description).to.be('D1');
      expect(b.numeroLigne).to.be(2);
      expect(b.modele.description).to.be('D2');
    });

    describe('concernant le statut renvoyé', () => {
      it("renvoie un statut INVALIDE dès qu'une erreur est présente", () => {
        const sansDescription = {
          description: '',
          descriptionLongue: '',
          categorie: 'Gouvernance',
        };

        const rapport = unTeleversement([sansDescription]).rapportDetaille({});

        expect(rapport.statut).to.be('INVALIDE');
      });

      it("renvoie un statut INVALIDE si aucun modèle n'est présent", () => {
        const rapportVide = unTeleversement([]).rapportDetaille({});

        expect(rapportVide.statut).to.be('INVALIDE');
      });

      it("renvoie un statut VALIDE quand il n'y a aucune erreur", () => {
        const rapportValide = unTeleversement([
          { description: 'D1', categorie: 'Gouvernance' },
        ]).rapportDetaille({});

        expect(rapportValide.statut).to.be('VALIDE');
      });
    });
  });
});
