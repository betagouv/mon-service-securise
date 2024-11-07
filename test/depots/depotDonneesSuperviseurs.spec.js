const expect = require('expect.js');
const depotDonneesSuperviseurs = require('../../src/depots/depotDonneesSuperviseurs');
const {
  unePersistanceMemoire,
} = require('../constructeurs/constructeurAdaptateurPersistanceMemoire');

describe('Le dépôt de données des superviseurs', () => {
  let depot;
  let adaptateurPersistance;

  beforeEach(() => {
    adaptateurPersistance = unePersistanceMemoire().construis();
    depot = depotDonneesSuperviseurs.creeDepot({ adaptateurPersistance });
  });

  it('délègue à la persistance la lecture des superviseurs concernés par un siret', async () => {
    let siretRecu;
    adaptateurPersistance.lisSuperviseursConcernes = async (siret) => {
      siretRecu = siret;
    };

    await depot.lisSuperviseurs('SIRET');

    expect(siretRecu).to.eql('SIRET');
  });

  it("délègue à la persistance l'ajout d'établissements supervisés", async () => {
    let siretRecu;
    let idSuperviseurRecu;
    adaptateurPersistance.ajouteSiretAuSuperviseur = async (
      idSuperviseur,
      siret
    ) => {
      idSuperviseurRecu = idSuperviseur;
      siretRecu = siret;
    };

    await depot.ajouteSiretAuSuperviseur('US1', 'SIRET-123');

    expect(idSuperviseurRecu).to.eql('US1');
    expect(siretRecu).to.eql('SIRET-123');
  });
});
