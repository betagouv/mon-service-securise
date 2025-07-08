const expect = require('expect.js');

const {
  ErreurCategorieInconnue,
  ErreurStatutMesureInvalide,
  ErreurPrioriteMesureInvalide,
  ErreurEcheanceMesureInvalide,
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

  elle("persiste sa date d'échéance au format ISO en UTC", () => {
    const janvierNonIso = '01/23/2024 10:00Z';
    const avecEcheance = new MesureSpecifique(
      { echeance: janvierNonIso },
      referentiel
    );

    const persistance = avecEcheance.donneesSerialisees();

    expect(persistance.echeance).to.be('2024-01-23T10:00:00.000Z');
  });
});
