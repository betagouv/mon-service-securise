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
        actionSuivante: { position: 1, description: "Description de l'action suivante" },
        uneAction: { position: 0, description: 'Une description' },
      },
    });

    const actions = new ActionsSaisie(referentiel, uneHomologation());

    expect(actions.toJSON()).to.eql([
      {
        id: 'uneAction',
        description: 'Une description',
        sousTitre: undefined,
        statut: InformationsHomologation.A_SAISIR,
      },
      {
        id: 'actionSuivante',
        description: "Description de l'action suivante",
        sousTitre: undefined,
        statut: InformationsHomologation.A_SAISIR,
      },
    ]);
  });
});
