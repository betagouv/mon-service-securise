const expect = require('expect.js');

const { unService } = require('../constructeurs/constructeurService');
const ActionSaisie = require('../../src/modeles/actionSaisie');
const InformationsHomologation = require('../../src/modeles/informationsHomologation');

const {
  ErreurIdentifiantActionSaisieInvalide,
  ErreurIdentifiantActionSaisieManquant,
} = require('../../src/erreurs');
const Referentiel = require('../../src/referentiel');

describe('Une action de saisie', () => {
  it('connaît son identifiant', () => {
    const referentiel = Referentiel.creeReferentiel({
      actionsSaisie: { uneAction: {} },
    });

    const action = new ActionSaisie({ id: 'uneAction' }, referentiel);
    expect(action.id).to.equal('uneAction');
  });

  it('sait se décrire comme un objet JSON', () => {
    const referentiel = Referentiel.creeReferentiel({
      actionsSaisie: {
        uneAction: {
          position: 0,
          description: 'Une description',
          sousTitre: 'Un sous-titre',
          rubriqueDroit: 'DECRIRE',
        },
      },
    });

    const service = unService().avecId('ABC').construis();
    service.statutSaisie = () => InformationsHomologation.A_SAISIR;

    const action = new ActionSaisie({ id: 'uneAction' }, referentiel, service);

    expect(action.toJSON()).to.eql({
      id: 'uneAction',
      position: 0,
      description: 'Une description',
      sousTitre: 'Un sous-titre',
      statut: InformationsHomologation.A_SAISIR,
      url: `/service/ABC/uneAction`,
      rubriqueDroit: 'DECRIRE',
    });
  });

  it("exige la présence que l'identifiant soit renseigné", (done) => {
    try {
      new ActionSaisie();
      done("La création de l'action de saisie aurait dû lever une erreur");
    } catch (e) {
      expect(e).to.be.a(ErreurIdentifiantActionSaisieManquant);
      expect(e.message).to.equal(
        "L'identifiant d'action de saisie doit être renseigné"
      );
      done();
    }
  });

  it("vérifie la validité de l'identifiant", (done) => {
    try {
      new ActionSaisie({ id: 'actionInvalide' });
      done("La création de l'action de saisie aurait dû lever une erreur");
    } catch (e) {
      expect(e).to.be.a(ErreurIdentifiantActionSaisieInvalide);
      expect(e.message).to.equal(
        'L\'action de saisie "actionInvalide" est invalide'
      );
      done();
    }
  });
});
