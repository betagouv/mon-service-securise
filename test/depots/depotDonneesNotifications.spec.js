import expect from 'expect.js';
import { unePersistanceMemoire } from '../constructeurs/constructeurAdaptateurPersistanceMemoire.js';
import { creeDepot } from '../../src/depots/depotDonneesNotifications.js';
import * as DepotDonneesServices from '../../src/depots/depotDonneesServices.js';
import fauxAdaptateurChiffrement from '../mocks/adaptateurChiffrement.js';
import { unService } from '../constructeurs/constructeurService.js';
import { unUtilisateur } from '../constructeurs/constructeurUtilisateur.js';
import { uneAutorisation } from '../constructeurs/constructeurAutorisation.js';
import { creeReferentielVide } from '../../src/referentiel.js';
import Service from '../../src/modeles/service.js';
import * as DepotDonneesUtilisateurs from '../../src/depots/depotDonneesUtilisateurs.js';

describe('Le dépôt de données des notifications', () => {
  let depotNotifications;
  let adaptateurPersistance;
  let referentiel;

  beforeEach(() => {
    referentiel = creeReferentielVide();

    adaptateurPersistance = unePersistanceMemoire().construis();
    const adaptateurChiffrement = fauxAdaptateurChiffrement();
    const depotServices = DepotDonneesServices.creeDepot({
      adaptateurChiffrement,
      adaptateurPersistance,
      referentiel,
      depotDonneesUtilisateurs: DepotDonneesUtilisateurs.creeDepot({
        adaptateurPersistance,
        adaptateurChiffrement,
      }),
    });
    depotNotifications = creeDepot({
      adaptateurPersistance,
      depotServices,
    });
  });

  describe("sur demande de marquage d'une nouveauté comme lue", () => {
    it("délègue à l'adaptateur persistance le marquage", async () => {
      let donneesRecues;
      adaptateurPersistance.marqueNouveauteLue = async (
        idUtilisateur,
        idNouveaute
      ) => {
        donneesRecues = { idUtilisateur, idNouveaute };
      };
      await depotNotifications.marqueNouveauteLue('U1', 'N1');

      expect(donneesRecues.idUtilisateur).to.be('U1');
      expect(donneesRecues.idNouveaute).to.be('N1');
    });
  });

  describe("sur demande de marquage d'une tâche de service comme 'lue'", () => {
    it("délègue à l'adaptateur persistance le marquage", async () => {
      let donneesRecues;
      adaptateurPersistance.marqueTacheDeServiceLue = async (idTache) => {
        donneesRecues = { idTache };
      };

      await depotNotifications.marqueTacheDeServiceLue('T1');

      expect(donneesRecues.idTache).to.be('T1');
    });
  });

  describe('sur demande de la liste des tâches de service', () => {
    it('utiliser l’adaptateur de persistance pour récupérer toutes les tâches', async () => {
      let adaptateurAppele;
      let idUtilisateurUtilise;
      adaptateurPersistance.tachesDeServicePour = async (idUtilisateur) => {
        adaptateurAppele = true;
        idUtilisateurUtilise = idUtilisateur;
        return [];
      };

      await depotNotifications.tachesDesServices('U1');

      expect(adaptateurAppele).to.be(true);
      expect(idUtilisateurUtilise).to.be('U1');
    });

    it('complète chaque tâche avec son service', async () => {
      await adaptateurPersistance.ajouteUtilisateur(
        'U1',
        unUtilisateur().avecId('U1').donnees
      );
      await adaptateurPersistance.sauvegardeService(
        'S1',
        unService(referentiel).avecNomService('Nom du service').avecId('S1')
          .donnees
      );
      await adaptateurPersistance.ajouteAutorisation(
        'A1',
        uneAutorisation().deProprietaire('U1', 'S1').donnees
      );

      adaptateurPersistance.tachesDeServicePour = async (_) => [
        { idService: 'S1' },
      ];

      const taches = await depotNotifications.tachesDesServices('U1');

      expect(taches[0].service).to.be.an(Service);
      expect(taches[0].service.nomService()).to.be('Nom du service');
    });
  });
});
