const expect = require('expect.js');
const DepotDonneesParrainages = require('../../src/depots/depotDonneesParrainages');
const Parrainage = require('../../src/modeles/parrainage');

describe('Le dépôt de données des parrainages', () => {
  let adaptateurPersistance;

  const depot = () =>
    DepotDonneesParrainages.creeDepot({ adaptateurPersistance });

  it("délègue à l'adaptateur persistance la sauvegarde du parrainage", async () => {
    let idUtilisateurFilleulRecu;
    let idUtilisateurParrainRecu;
    let filleulAFinaliseCompteRecu;
    adaptateurPersistance = {
      ajouteParrainage: async (
        idUtilisateurFilleul,
        idUtilisateurParrain,
        filleulAFinaliseCompte
      ) => {
        idUtilisateurFilleulRecu = idUtilisateurFilleul;
        idUtilisateurParrainRecu = idUtilisateurParrain;
        filleulAFinaliseCompteRecu = filleulAFinaliseCompte;
      },
    };

    const parrainage = new Parrainage({
      idUtilisateurFilleul: 'F1',
      idUtilisateurParrain: 'P1',
      filleulAFinaliseCompte: true,
    });

    await depot().ajouteParrainage(parrainage);

    expect(idUtilisateurFilleulRecu).to.be('F1');
    expect(idUtilisateurParrainRecu).to.be('P1');
    expect(filleulAFinaliseCompteRecu).to.be(true);
  });
});
