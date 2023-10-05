const expect = require('expect.js');

const { unService } = require('../constructeurs/constructeurService');
const Referentiel = require('../../src/referentiel');
const ActionsSaisie = require('../../src/modeles/actionsSaisie');
const InformationsHomologation = require('../../src/modeles/informationsHomologation');

const elles = it;

const unServiceASaisir = () => {
  const service = unService().avecId('ABC').construis();
  service.statutSaisie = () => InformationsHomologation.A_SAISIR;
  return service;
};

describe("Les actions de saisie d'un service", () => {
  elles('retournent les infos de chaque action triée par position', () => {
    const referentiel = Referentiel.creeReferentiel({
      actionsSaisie: {
        actionSuivante: {
          position: 1,
          description: "Description de l'action suivante",
        },
        uneAction: {
          position: 0,
          description: 'Une description',
        },
      },
    });

    const actions = new ActionsSaisie(referentiel, unServiceASaisir());

    const [action1, action2] = actions.toJSON();
    expect(action1.position).to.be(0);
    expect(action2.position).to.be(1);
  });
});
