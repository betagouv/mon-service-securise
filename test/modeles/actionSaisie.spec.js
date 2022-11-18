const expect = require('expect.js');

const ActionSaisie = require('../../src/modeles/actionSaisie');
const Homologation = require('../../src/modeles/homologation');
const InformationsHomologation = require('../../src/modeles/informationsHomologation');

const {
  ErreurIdentifiantActionSaisieInvalide,
  ErreurIdentifiantActionSaisieManquant,
} = require('../../src/erreurs');
const Referentiel = require('../../src/referentiel');

describe('Une action de saisie', () => {
  it('connaît son identifiant', () => {
    const referentiel = Referentiel.creeReferentiel({ actionsSaisie: { uneAction: {} } });

    const action = new ActionSaisie({ id: 'uneAction' }, referentiel);
    expect(action.id).to.equal('uneAction');
  });

  it('connaît sa description', () => {
    const referentiel = Referentiel.creeReferentiel({
      actionsSaisie: { uneAction: { description: 'Une description' } },
    });

    const action = new ActionSaisie({ id: 'uneAction' }, referentiel);
    expect(action.description()).to.equal('Une description');
  });

  it("connaît l'identifiant de l'action suivante", () => {
    const referentiel = Referentiel.creeReferentiel({
      actionsSaisie: { uneAction: { position: 0 }, actionSuivante: { position: 1 } },
    });

    const action = new ActionSaisie({ id: 'uneAction' }, referentiel);
    expect(action.suivante()).to.equal('actionSuivante');
  });

  it('connaît son sous-titre', () => {
    const referentiel = Referentiel.creeReferentiel({
      actionsSaisie: { uneAction: { sousTitre: 'Un sous-titre' } },
    });

    const action = new ActionSaisie({ id: 'uneAction' }, referentiel);
    expect(action.sousTitre()).to.equal('Un sous-titre');
  });

  it('sait si elle est indisponible', () => {
    const referentiel = Referentiel.creeReferentiel({
      actionsSaisie: { uneAction: {}, uneActionIndisponible: { indisponible: true } },
    });

    const action = new ActionSaisie({ id: 'uneAction' }, referentiel);
    expect(action.indisponible()).to.be(false);

    const actionIndisponible = new ActionSaisie({ id: 'uneActionIndisponible' }, referentiel);
    expect(actionIndisponible.indisponible()).to.be(true);
  });

  it('connaît son statut', () => {
    const referentiel = Referentiel.creeReferentiel({
      actionsSaisie: { uneAction: {} },
    });

    const homologation = new Homologation({});
    homologation.statutSaisie = () => InformationsHomologation.COMPLETES;

    const action = new ActionSaisie({ id: 'uneAction' }, referentiel, homologation);
    expect(action.statut()).to.equal(InformationsHomologation.COMPLETES);
  });

  it("retourne le statut « À saisir » si l'action est indisponible", () => {
    const referentiel = Referentiel.creeReferentiel({
      actionsSaisie: { uneAction: { indisponible: true } },
    });

    const homologation = new Homologation({});
    homologation.statutSaisie = () => InformationsHomologation.COMPLETES;

    const action = new ActionSaisie({ id: 'uneAction' }, referentiel, homologation);
    expect(action.statut()).to.equal(InformationsHomologation.A_SAISIR);
  });

  it('sait se décrire comme un objet JSON', () => {
    const referentiel = Referentiel.creeReferentiel({
      actionsSaisie: {
        uneAction: { position: 0, indisponible: true, description: 'Une description', sousTitre: 'Un sous-titre' },
      },
    });

    const homologation = new Homologation({});
    homologation.statutSaisie = () => InformationsHomologation.A_SAISIR;

    const action = new ActionSaisie({ id: 'uneAction' }, referentiel, homologation);
    expect(action.toJSON()).to.eql({
      id: 'uneAction',
      indisponible: true,
      description: 'Une description',
      sousTitre: 'Un sous-titre',
      statut: InformationsHomologation.A_SAISIR,
    });
  });

  it("exige la présence que l'identifiant soit renseigné", (done) => {
    try {
      new ActionSaisie();
      done("La création de l'action de saisie aurait dû lever une erreur");
    } catch (e) {
      expect(e).to.be.a(ErreurIdentifiantActionSaisieManquant);
      expect(e.message).to.equal("L'identifiant d'action de saisie doit être renseigné");
      done();
    }
  });

  it("vérifie la validité de l'identifiant", (done) => {
    try {
      new ActionSaisie({ id: 'actionInvalide' });
      done("La création de l'action de saisie aurait dû lever une erreur");
    } catch (e) {
      expect(e).to.be.a(ErreurIdentifiantActionSaisieInvalide);
      expect(e.message).to.equal("L'action de saisie \"actionInvalide\" est invalide");
      done();
    }
  });
});
