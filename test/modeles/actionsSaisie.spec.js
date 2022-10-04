const expect = require('expect.js');

const Referentiel = require('../../src/referentiel');
const ActionsSaisie = require('../../src/modeles/actionsSaisie');
const Homologation = require('../../src/modeles/homologation');
const InformationsHomologation = require('../../src/modeles/informationsHomologation');

const elles = it;

function uneHomologation() {
  const homologation = new Homologation({});
  homologation.statutSaisie = () => InformationsHomologation.A_SAISIR;
  return homologation;
}

describe("Les actions de saisie d'une homologation", () => {
  elles('retournent les infos de chaque action triée par position', () => {
    const referentiel = Referentiel.creeReferentiel({
      actionsSaisie: {
        v1: {
          actionSuivante: { position: 1, description: "Description de l'action suivante" },
          uneAction: { position: 0, description: 'Une description' },
        },
      },
    });

    const actions = new ActionsSaisie('v1', referentiel, uneHomologation());

    expect(actions.toJSON()).to.eql([
      {
        id: 'uneAction',
        description: 'Une description',
        statut: InformationsHomologation.A_SAISIR,
      },
      {
        id: 'actionSuivante',
        description: "Description de l'action suivante",
        statut: InformationsHomologation.A_SAISIR,
      },
    ]);
  });

  elles('peuvent être choisies par leur version', () => {
    const referentiel = Referentiel.creeReferentiel({
      actionsSaisie: {
        v1: { uneAction: { position: 0, description: 'Une action V1' } },
        v2: { uneAction: { position: 0, description: 'Une action V2' } },
      },
    });

    const actions = new ActionsSaisie('v2', referentiel, uneHomologation());

    const [action] = actions.toJSON();
    expect(action.id).to.equal('uneAction');
    expect(action.description).to.equal('Une action V2');
  });
});
