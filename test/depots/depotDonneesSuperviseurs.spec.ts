import * as depotDonneesSuperviseurs from '../../src/depots/depotDonneesSuperviseurs.js';
import { unePersistanceMemoire } from '../constructeurs/constructeurAdaptateurPersistanceMemoire.js';
import { DepotDonneesSuperviseurs } from '../../src/depots/depotDonneesSuperviseurs.interface.ts';
import { AdaptateurPersistance } from '../../src/adaptateurs/adaptateurPersistance.interface.ts';
import { unUUID } from '../constructeurs/UUID.ts';

describe('Le dépôt de données des superviseurs', () => {
  let depot: DepotDonneesSuperviseurs;
  let adaptateurPersistance: AdaptateurPersistance;

  beforeEach(() => {
    adaptateurPersistance =
      unePersistanceMemoire().construis() as AdaptateurPersistance;
    depot = depotDonneesSuperviseurs.creeDepot({
      adaptateurPersistance,
    });
  });

  it("délègue à la persistance la révocation d'un superviseur", async () => {
    let idRecu;
    adaptateurPersistance.revoqueSuperviseur = async (idUtilisateur) => {
      idRecu = idUtilisateur;
    };

    await depot.revoqueSuperviseur(unUUID('1'));

    expect(idRecu).toEqual(unUUID('1'));
  });
});
