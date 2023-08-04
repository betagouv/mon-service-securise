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
        uneAction: { position: 0, description: 'Une description' },
      },
    });

    const actions = new ActionsSaisie(referentiel, unServiceASaisir());

    expect(actions.toJSON()).to.eql([
      {
        id: 'uneAction',
        description: 'Une description',
        sousTitre: undefined,
        statut: InformationsHomologation.A_SAISIR,
        url: '/service/ABC/uneAction',
      },
      {
        id: 'actionSuivante',
        description: "Description de l'action suivante",
        sousTitre: undefined,
        statut: InformationsHomologation.A_SAISIR,
        url: '/service/ABC/actionSuivante',
      },
    ]);
  });
});
