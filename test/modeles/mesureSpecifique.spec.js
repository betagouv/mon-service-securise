const expect = require('expect.js');

const { ErreurCategorieInconnue, ErreurStatutMesureInvalide } = require('../../src/erreurs');
const Referentiel = require('../../src/referentiel');
const InformationsHomologation = require('../../src/modeles/informationsHomologation');
const MesureSpecifique = require('../../src/modeles/mesureSpecifique');

const elle = it;

describe('Une mesure spécifique', () => {
  const referentiel = Referentiel.creeReferentiel({
    categoriesMesures: { uneCategorie: 'Une catégorie' },
  });

  elle('sait se décrire', () => {
    const mesure = new MesureSpecifique({
      description: 'Une mesure spécifique',
      categorie: 'uneCategorie',
      statut: 'fait',
      modalites: 'Des modalités de mise en œuvre',
    }, referentiel);

    expect(mesure.description).to.equal('Une mesure spécifique');
    expect(mesure.categorie).to.equal('uneCategorie');
    expect(mesure.statut).to.equal('fait');
    expect(mesure.modalites).to.equal('Des modalités de mise en œuvre');
  });

  elle('ne tient pas compte du champ `modalites` pour déterminer le statut de saisie', () => {
    const mesure = new MesureSpecifique({
      description: 'Une mesure spécifique',
      categorie: 'uneCategorie',
      statut: 'fait',
    }, referentiel);

    expect(mesure.statutSaisie()).to.equal(InformationsHomologation.COMPLETES);
  });

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

  elle('vérifie que la catégorie est bien répertoriée', (done) => {
    try {
      new MesureSpecifique({ categorie: 'categorieInconnue' });
      done('La création de la mesure aurait dû lever une exception.');
    } catch (e) {
      expect(e).to.be.an(ErreurCategorieInconnue);
      expect(e.message).to.equal("La catégorie \"categorieInconnue\" n'est pas répertoriée");
      done();
    }
  });

  elle("ne tient pas compte de la catégorie si elle n'est pas renseignée", (done) => {
    try {
      new MesureSpecifique();
      done();
    } catch {
      done("La création de la mesure sans catégorie n'aurait pas dû lever d'exception.");
    }
  });

  elle("n'est pas indispensable selon l'ANSSI", () => {
    const mesure = new MesureSpecifique();
    expect(mesure.estIndispensable()).to.be(false);
  });
});
