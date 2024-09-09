const expect = require('expect.js');

const AdaptateurPersistanceMemoire = require('../../src/adaptateurs/adaptateurPersistanceMemoire');
const DepotDonneesParcoursUtilisateur = require('../../src/depots/depotDonneesParcoursUtilisateur');
const ParcoursUtilisateur = require('../../src/modeles/parcoursUtilisateur');
const EtatVisiteGuidee = require('../../src/modeles/etatVisiteGuidee');
const { fabriqueBusPourLesTests } = require('../bus/aides/busPourLesTests');
const EvenementNouvelleConnexionUtilisateur = require('../../src/bus/evenementNouvelleConnexionUtilisateur');

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

  describe("sur demande d'enregistrement d'une nouvelle connexion utilisateur", () => {
    let busEvenements;

    beforeEach(() => {
      busEvenements = fabriqueBusPourLesTests();

      depot = DepotDonneesParcoursUtilisateur.creeDepot({
        adaptateurPersistance,
        busEvenements,
      });
    });

    it('sauvegarde la nouvelle date de connexion', async () => {
      await depot.enregistreNouvelleConnexionUtilisateur('123');

      const parcoursPersiste = await depot.lisParcoursUtilisateur('123');

      expect(parcoursPersiste.dateDerniereConnexion).not.to.be(undefined);
    });

    it("publie un événement de 'Nouvelle connexion utilisateur'", async () => {
      await depot.enregistreNouvelleConnexionUtilisateur('123');

      expect(
        busEvenements.aRecuUnEvenement(EvenementNouvelleConnexionUtilisateur)
      ).to.be(true);
      const evenement = busEvenements.recupereEvenement(
        EvenementNouvelleConnexionUtilisateur
      );
      expect(evenement.idUtilisateur).to.be('123');
      expect(evenement.dateDerniereConnexion).not.to.be(undefined);
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
    expect(parcours.etatVisiteGuidee).to.be.an(EtatVisiteGuidee);
    expect(parcours.etatVisiteGuidee.dejaTerminee).to.be(false);
  });
});
