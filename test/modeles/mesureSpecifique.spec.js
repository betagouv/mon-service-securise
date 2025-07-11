const expect = require('expect.js');

const {
  ErreurCategorieInconnue,
  ErreurStatutMesureInvalide,
  ErreurPrioriteMesureInvalide,
  ErreurEcheanceMesureInvalide,
  ErreurDetachementModeleMesureSpecifiqueImpossible,
} = require('../../src/erreurs');
const Referentiel = require('../../src/referentiel');
const InformationsService = require('../../src/modeles/informationsService');
const MesureSpecifique = require('../../src/modeles/mesureSpecifique');

const elle = it;

describe('Une mesure spécifique', () => {
  const referentiel = Referentiel.creeReferentiel({
    categoriesMesures: { uneCategorie: 'Une catégorie' },
  });

  elle('sait se décrire', () => {
    referentiel.enrichis({ prioritesMesures: { p3: {} } });

    const mesure = new MesureSpecifique(
      {
        description: 'Une mesure spécifique',
        descriptionLongue: 'Une description longue',
        idModele: 'M1',
        categorie: 'uneCategorie',
        statut: 'fait',
        modalites: 'Des modalités de mise en œuvre',
        priorite: 'p3',
        echeance: '01/01/2023',
        responsables: ['unIdUtilisateur', 'unAutreIdUtilisateur'],
      },
      referentiel
    );

    expect(mesure.description).to.equal('Une mesure spécifique');
    expect(mesure.descriptionLongue).to.equal('Une description longue');
    expect(mesure.idModele).to.equal('M1');
    expect(mesure.categorie).to.equal('uneCategorie');
    expect(mesure.statut).to.equal('fait');
    expect(mesure.modalites).to.equal('Des modalités de mise en œuvre');
    expect(mesure.priorite).to.equal('p3');
    expect(mesure.echeance.getTime()).to.equal(
      new Date('01/01/2023').getTime()
    );
    expect(mesure.responsables).to.eql([
      'unIdUtilisateur',
      'unAutreIdUtilisateur',
    ]);
  });

  elle('connaît ses propriétés obligatoires', () => {
    expect(MesureSpecifique.proprietesObligatoires()).to.eql([
      'id',
      'description',
      'categorie',
      'statut',
    ]);
  });

  elle(
    'ne tient pas compte du champ `modalites` ni de la priorite pour déterminer le statut de saisie',
    () => {
      const mesure = new MesureSpecifique(
        {
          id: 'x',
          description: 'Une mesure spécifique',
          categorie: 'uneCategorie',
          statut: 'fait',
        },
        referentiel
      );

      expect(mesure.statutSaisie()).to.equal(InformationsService.COMPLETES);
    }
  );

  elle('vérifie que le statut est bien valide', (done) => {
    try {
      new MesureSpecifique({ statut: 'statutInconnu' });
      done('La création de la mesure aurait dû lever une exception.');
    } catch (e) {
      expect(e).to.be.an(ErreurStatutMesureInvalide);
      expect(e.message).to.equal('Le statut "statutInconnu" est invalide');
      done();
    }
  });

  it('vérifie la valeur de la priorité', () => {
    referentiel.enrichis({ prioritesMesures: {} });
    try {
      new MesureSpecifique({ priorite: 'prioriteInvalide' }, referentiel);
      expect().fail('La création de la mesure aurait dû lever une exception');
    } catch (e) {
      expect(e).to.be.a(ErreurPrioriteMesureInvalide);
      expect(e.message).to.equal('La priorité "prioriteInvalide" est invalide');
    }
  });

  it("vérifie la valeur de l'échéance", () => {
    try {
      new MesureSpecifique({ echeance: 'pasUneDate' }, referentiel);
      expect().fail('La création de la mesure aurait dû lever une exception');
    } catch (e) {
      expect(e).to.be.a(ErreurEcheanceMesureInvalide);
      expect(e.message).to.equal('L\'échéance "pasUneDate" est invalide');
    }
  });

  elle('vérifie que la catégorie est bien répertoriée', (done) => {
    try {
      new MesureSpecifique({ categorie: 'categorieInconnue' });
      done('La création de la mesure aurait dû lever une exception.');
    } catch (e) {
      expect(e).to.be.an(ErreurCategorieInconnue);
      expect(e.message).to.equal(
        'La catégorie "categorieInconnue" n\'est pas répertoriée'
      );
      done();
    }
  });

  elle(
    "ne tient pas compte de la catégorie si elle n'est pas renseignée",
    (done) => {
      try {
        new MesureSpecifique();
        done();
      } catch {
        done(
          "La création de la mesure sans catégorie n'aurait pas dû lever d'exception."
        );
      }
    }
  );

  elle("n'est pas indispensable selon l'ANSSI", () => {
    const mesure = new MesureSpecifique();
    expect(mesure.estIndispensable()).to.be(false);
  });

  elle("n'est pas recommandée par l'ANSSI", () => {
    const mesure = new MesureSpecifique();
    expect(mesure.estRecommandee()).to.be(false);
  });

  elle('sait si son statut est renseigné', () => {
    const mesure = new MesureSpecifique({ statut: 'fait' });
    expect(mesure.statutRenseigne()).to.be(true);
  });

  describe('concernant la persistance', () => {
    let donneesMesureSpecifique;

    beforeEach(() => {
      referentiel.enrichis({ prioritesMesures: { p3: {} } });
      donneesMesureSpecifique = {
        id: 'M1',
        description: 'Une mesure spécifique',
        descriptionLongue: 'Une description longue',
        categorie: 'uneCategorie',
        statut: 'fait',
        modalites: 'Des modalités de mise en œuvre',
        priorite: 'p3',
        echeance: '01/23/2024 10:00Z',
        responsables: ['unIdUtilisateur', 'unAutreIdUtilisateur'],
      };
    });

    elle("persiste sa date d'échéance au format ISO en UTC", () => {
      const janvierNonIso = '01/23/2024 10:00Z';
      const avecEcheance = new MesureSpecifique(
        { echeance: janvierNonIso },
        referentiel
      );

      const persistance = avecEcheance.donneesSerialisees();

      expect(persistance.echeance).to.be('2024-01-23T10:00:00.000Z');
    });

    elle('persiste toutes ses données', () => {
      const mesureSpecifique = new MesureSpecifique(
        donneesMesureSpecifique,
        referentiel
      );

      const persistance = mesureSpecifique.donneesSerialisees();

      expect(persistance).to.eql({
        id: 'M1',
        description: 'Une mesure spécifique',
        descriptionLongue: 'Une description longue',
        categorie: 'uneCategorie',
        statut: 'fait',
        modalites: 'Des modalités de mise en œuvre',
        priorite: 'p3',
        echeance: '2024-01-23T10:00:00.000Z',
        responsables: ['unIdUtilisateur', 'unAutreIdUtilisateur'],
      });
    });

    elle(
      'ne persiste pas les données du modèle si la mesure a un modèle, car elles ne doivent apparaître que dans le modèle',
      () => {
        const mesureAvecModele = new MesureSpecifique(
          { ...donneesMesureSpecifique, idModele: 'MS1' },
          referentiel
        );

        const persistance = mesureAvecModele.donneesSerialisees();

        expect(persistance.description).to.be(undefined);
        expect(persistance.descriptionLongue).to.be(undefined);
        expect(persistance.categorie).to.be(undefined);
      }
    );
  });

  describe('concernant le détachement de son modèle', () => {
    it("jette une erreur si la mesure n'est pas reliée à un modèle", () => {
      const mesure = new MesureSpecifique({ id: 'MS1', idModele: undefined });

      expect(() => mesure.detacheDeSonModele()).to.throwError((e) => {
        expect(e).to.be.an(ErreurDetachementModeleMesureSpecifiqueImpossible);
        expect(e.message).to.be(
          "Impossible de détacher la mesure 'MS1' : elle n'est pas reliée à un modèle."
        );
      });
    });

    it("supprime l'identifiant du modèle, la rendant donc autonome", () => {
      const mesure = new MesureSpecifique({
        id: 'MS1',
        idModele: 'MOD-1',
        statut: 'fait',
        description: 'Ma mesure spécifique',
      });

      mesure.detacheDeSonModele();

      expect(mesure.donneesSerialisees()).to.eql({
        id: 'MS1',
        description: 'Ma mesure spécifique',
        responsables: [],
        statut: 'fait',
      });
    });
  });
});
