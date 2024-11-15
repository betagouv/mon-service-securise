const expect = require('expect.js');

const {
  metAJourParrainage,
} = require('../../../src/bus/abonnements/metAJourParrainage');
const {
  unUtilisateur,
} = require('../../constructeurs/constructeurUtilisateur');
const Parrainage = require('../../../src/modeles/parrainage');

describe('L’abonnement qui met à jour les parrainages', () => {
  it('utilise le dépôt pour trouver le parrainage existant', async () => {
    let donneesRecues;
    const depotDonnees = {
      metsAJourParrainage: async () => {},
      parrainagePour: async (donnees) => {
        donneesRecues = donnees;
      },
    };

    const abonnement = metAJourParrainage({ depotDonnees });
    await abonnement({
      utilisateur: unUtilisateur().avecId('U1').construis(),
    });

    expect(donneesRecues).to.be('U1');
  });

  it('délègue au dépôt la sauvegarde de la confirmation du compte parrainé', async () => {
    let donneesRecues;
    const depotDonnees = {
      metsAJourParrainage: async (donnees) => {
        donneesRecues = donnees;
      },
      parrainagePour: async () => Parrainage.nouveauParrainage('U1', 'P1'),
    };

    const abonnement = metAJourParrainage({ depotDonnees });
    await abonnement({
      utilisateur: unUtilisateur().avecId('U1').construis(),
    });

    expect(donneesRecues.idUtilisateurFilleul).to.be('U1');
    expect(donneesRecues.idUtilisateurParrain).to.be('P1');
    expect(donneesRecues.filleulAFinaliseCompte).to.be(true);
  });

  it("reste robuste si l'utilisateur n'était pas parrainé", async () => {
    const depotDonnees = {
      metsAJourParrainage: async () => {
        expect().fail("n'aurait pas dû appeler la mise à jour");
      },
      parrainagePour: async () => undefined,
    };

    const abonnement = metAJourParrainage({ depotDonnees });
    await abonnement({
      utilisateur: unUtilisateur().avecId('U1').construis(),
    });

    // n'est pas passé dans expect().fail() et n'a pas throw
  });

  it('ne fait pas de modification si le compte parrainé était déjà confirmé', async () => {
    const depotDonnees = {
      metsAJourParrainage: async () => {
        expect().fail("n'aurait pas dû appeler la mise à jour");
      },
      parrainagePour: async () =>
        new Parrainage({
          idUtilisateurFilleul: 'U1',
          filleulAFinaliseCompte: true,
        }),
    };

    const abonnement = metAJourParrainage({ depotDonnees });
    await abonnement({
      utilisateur: unUtilisateur().avecId('U1').construis(),
    });

    // n'est pas passé dans expect().fail() de metsAJourParrainage
  });
});
