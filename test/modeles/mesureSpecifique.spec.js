const expect = require('expect.js');

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
});
