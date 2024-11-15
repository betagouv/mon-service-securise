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

  it("délègue à l'adaptateur persistance la mise à jour du parrainage", async () => {
    let idUtilisateurFilleulRecu;
    let filleulAFinaliseCompteRecu;
    adaptateurPersistance = {
      metsAJourParrainage: async (
        idUtilisateurFilleul,
        filleulAFinaliseCompte
      ) => {
        idUtilisateurFilleulRecu = idUtilisateurFilleul;
        filleulAFinaliseCompteRecu = filleulAFinaliseCompte;
      },
    };

    const parrainage = new Parrainage({
      idUtilisateurFilleul: 'F1',
      idUtilisateurParrain: 'P1',
      filleulAFinaliseCompte: true,
    });

    await depot().metsAJourParrainage(parrainage);

    expect(idUtilisateurFilleulRecu).to.be('F1');
    expect(filleulAFinaliseCompteRecu).to.be(true);
  });

  it("délègue à l'adaptateur persistance la récupération d'un parrainage selon l'id du filleul", async () => {
    let idUtilisateurFilleulRecu;
    adaptateurPersistance = {
      parrainagePour: async (idUtilisateurFilleul) => {
        idUtilisateurFilleulRecu = idUtilisateurFilleul;
        return {
          idUtilisateurFilleul: 'F1',
          idUtilisateurParrain: 'P1',
          filleulAFinaliseCompte: true,
        };
      },
    };

    const resultat = await depot().parrainagePour('F1');

    expect(idUtilisateurFilleulRecu).to.be('F1');
    expect(resultat).to.be.a(Parrainage);
    expect(resultat.filleulAFinaliseCompte).to.be(true);
    expect(resultat.idUtilisateurFilleul).to.be('F1');
    expect(resultat.idUtilisateurParrain).to.be('P1');
  });
});
