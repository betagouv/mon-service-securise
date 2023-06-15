const expect = require('expect.js');

const AdaptateurPersistanceMemoire = require('../../src/adaptateurs/adaptateurPersistanceMemoire');
const DepotDonneesParcoursUtilisateur = require('../../src/depots/depotDonneesParcoursUtilisateur');
const ParcoursUtilisateur = require('../../src/modeles/parcoursUtilisateur');

describe('Le dépôt de données Parcours utilisateur', () => {
  let adaptateurPersistance;
  let depot;
  beforeEach(() => {
    adaptateurPersistance = AdaptateurPersistanceMemoire.nouvelAdaptateur({
      parcoursUtilisateurs: [],
    });
    depot = DepotDonneesParcoursUtilisateur.creeDepot({
      adaptateurPersistance,
    });
  });

  describe('sur demande de sauvegarde', () => {
    it("utilise l'ID utilisateur comme ID de stockage", async () => {
      let idRecu;
      adaptateurPersistance.sauvegardeParcoursUtilisateur = async (id, _) => {
        idRecu = id;
      };

      await depot.sauvegardeParcoursUtilisateur(
        new ParcoursUtilisateur({ idUtilisateur: '123' })
      );

      expect(idRecu).to.equal('123');
    });

    it('stocke les données du parcours utilisateur', async () => {
      await depot.sauvegardeParcoursUtilisateur(
        new ParcoursUtilisateur({
          idUtilisateur: '123',
          dateDerniereConnexion: '2023-01-01',
        })
      );

      const parcoursPersiste = await depot.lisParcoursUtilisateur('123');

      expect(parcoursPersiste.dateDerniereConnexion).to.equal('2023-01-01');
    });
  });

  it("sait fournir une instance par défaut lorsqu'aucun parcours n'est stocké pour un utilisateur", async () => {
    const parcours = await depot.lisParcoursUtilisateur('nouvel utilisateur');

    expect(parcours).to.be.a(ParcoursUtilisateur);
    expect(parcours.idUtilisateur).to.equal('nouvel utilisateur');
  });
});
