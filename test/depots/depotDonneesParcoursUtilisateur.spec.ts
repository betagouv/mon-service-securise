import * as AdaptateurPersistanceMemoire from '../../src/adaptateurs/adaptateurPersistanceMemoire.js';
import * as DepotDonneesParcoursUtilisateur from '../../src/depots/depotDonneesParcoursUtilisateur.js';
import {
  DepotDonneesParcoursUtilisateurs,
  PersistanceParcoursUtilisateur,
} from '../../src/depots/depotDonneesParcoursUtilisateur.js';
import ParcoursUtilisateur, {
  DonneesParcoursUtilisateur,
} from '../../src/modeles/parcoursUtilisateur.js';
import EtatVisiteGuidee from '../../src/modeles/etatVisiteGuidee.js';
import { fabriqueBusPourLesTests } from '../bus/aides/busPourLesTests.js';
import EvenementNouvelleConnexionUtilisateur from '../../src/bus/evenementNouvelleConnexionUtilisateur.js';
import { unService } from '../constructeurs/constructeurService.js';
import { VersionService } from '../../src/modeles/versionService.js';
import { uneAutorisation } from '../constructeurs/constructeurAutorisation.js';
import { creeReferentielVide } from '../../src/referentiel.js';
import BusEvenements from '../../src/bus/busEvenements.js';
import { Referentiel } from '../../src/referentiel.interface.ts';
import { unUUID } from '../constructeurs/UUID.ts';
import { SourceAuthentification } from '../../src/modeles/sourceAuthentification.ts';

describe('Le dépôt de données Parcours utilisateur', () => {
  let adaptateurPersistance: PersistanceParcoursUtilisateur;
  let depot: DepotDonneesParcoursUtilisateurs;
  let busEvenements: ReturnType<typeof fabriqueBusPourLesTests>;
  let referentiel: Referentiel;

  const donneesParcoursUtilisateur = (): DonneesParcoursUtilisateur => ({
    idUtilisateur: unUUID('1'),
    explicationNouveauReferentiel: {
      dejaTermine: false,
    },
    aVuTableauDeBordDepuisConnexion: true,
    etatVisiteGuidee: {
      dejaTerminee: false,
      enPause: false,
    },
  });

  beforeEach(() => {
    referentiel = creeReferentielVide();
    adaptateurPersistance = AdaptateurPersistanceMemoire.nouvelAdaptateur({
      parcoursUtilisateurs: [],
    });
    busEvenements = fabriqueBusPourLesTests();
    depot = DepotDonneesParcoursUtilisateur.creeDepot({
      adaptateurPersistance,
      busEvenements: busEvenements as unknown as BusEvenements,
      referentiel,
    });
  });

  describe("sur demande d'enregistrement d'une nouvelle connexion utilisateur", () => {
    it('sauvegarde la nouvelle date de connexion', async () => {
      await depot.enregistreNouvelleConnexionUtilisateur(
        unUUID('1'),
        SourceAuthentification.MSS
      );

      const parcoursPersiste = await depot.lisParcoursUtilisateur(unUUID('1'));

      expect(parcoursPersiste.dateDerniereConnexion).not.toBe(undefined);
    });

    describe("sur publication d'un évènement de 'Nouvelle connexion utilisateur'", () => {
      it("publie un événement de 'Nouvelle connexion utilisateur'", async () => {
        await depot.enregistreNouvelleConnexionUtilisateur(
          unUUID('1'),
          SourceAuthentification.AGENT_CONNECT,
          true
        );

        expect(
          busEvenements.aRecuUnEvenement(EvenementNouvelleConnexionUtilisateur)
        ).toBe(true);
        const evenement = busEvenements.recupereEvenement(
          EvenementNouvelleConnexionUtilisateur
        );
        expect(evenement.idUtilisateur).toBe(unUUID('1'));
        expect(evenement.dateDerniereConnexion).not.toBe(undefined);
        expect(evenement.source).toBe(SourceAuthentification.AGENT_CONNECT);
        expect(evenement.connexionAvecMFA).toBe(true);
      });

      it("utilise une valeur 'false' par défaut si `connexionAvecMFA` n'est pas fourni", async () => {
        await depot.enregistreNouvelleConnexionUtilisateur(
          unUUID('1'),
          SourceAuthentification.MSS
        );

        expect(
          busEvenements.aRecuUnEvenement(EvenementNouvelleConnexionUtilisateur)
        ).toBe(true);
        const evenement = busEvenements.recupereEvenement(
          EvenementNouvelleConnexionUtilisateur
        );
        expect(evenement.connexionAvecMFA).toBe(false);
      });
    });

    it("indique que l'utilisateur n'a pas encore vu le tableau de bord depuis sa connexion", async () => {
      await depot.sauvegardeParcoursUtilisateur(
        new ParcoursUtilisateur(donneesParcoursUtilisateur())
      );
      await depot.enregistreNouvelleConnexionUtilisateur(
        unUUID('1'),
        SourceAuthentification.MSS
      );

      const parcoursPersiste = await depot.lisParcoursUtilisateur(unUUID('1'));

      expect(
        parcoursPersiste.explicationNouveauReferentiel
          .aVuTableauDeBordDepuisConnexion
      ).toBe(false);
    });
  });

  describe('sur demande de sauvegarde', () => {
    it("utilise l'ID utilisateur comme ID de stockage", async () => {
      let idRecu;
      adaptateurPersistance.sauvegardeParcoursUtilisateur = async (id) => {
        idRecu = id;
      };

      await depot.sauvegardeParcoursUtilisateur(
        new ParcoursUtilisateur(donneesParcoursUtilisateur())
      );

      expect(idRecu).toEqual(unUUID('1'));
    });

    it('stocke les données du parcours utilisateur', async () => {
      await depot.sauvegardeParcoursUtilisateur(
        new ParcoursUtilisateur({
          ...donneesParcoursUtilisateur(),
          dateDerniereConnexion: '2023-01-01',
        })
      );

      const parcoursPersiste = await depot.lisParcoursUtilisateur(unUUID('1'));

      expect(parcoursPersiste.dateDerniereConnexion).toEqual('2023-01-01');
    });
  });

  describe('sur demande de lecture', () => {
    it("sait fournir une instance par défaut lorsqu'aucun parcours n'est stocké pour un utilisateur", async () => {
      const parcours = await depot.lisParcoursUtilisateur(unUUID('z'));

      expect(parcours).toBeInstanceOf(ParcoursUtilisateur);
      expect(parcours.idUtilisateur).toEqual(unUUID('z'));
      expect(parcours.etatVisiteGuidee).toBeInstanceOf(EtatVisiteGuidee);
      expect(parcours.etatVisiteGuidee.dejaTerminee).toBe(false);
    });

    it('sait lire les versions de service pour un utilisateur ayant un parcours', async () => {
      adaptateurPersistance = AdaptateurPersistanceMemoire.nouvelAdaptateur({
        parcoursUtilisateurs: [{ id: unUUID('1') }],
        services: [
          unService().avecVersion(VersionService.v1).avecId('S1').construis(),
        ],
        autorisations: [
          uneAutorisation().deProprietaire(unUUID('1'), 'S1').construis(),
        ],
      });
      depot = DepotDonneesParcoursUtilisateur.creeDepot({
        adaptateurPersistance,
        busEvenements: busEvenements as unknown as BusEvenements,
        referentiel,
      });

      const parcours = await depot.lisParcoursUtilisateur(unUUID('1'));

      expect(parcours.explicationNouveauReferentiel.versionsService).toEqual([
        VersionService.v1,
      ]);
    });

    it("sait lire les versions de service pour un utilisateur n'ayant pas de parcours (ex: invité mais jamais connecté)", async () => {
      adaptateurPersistance = AdaptateurPersistanceMemoire.nouvelAdaptateur({
        parcoursUtilisateurs: [],
        services: [
          unService().avecVersion(VersionService.v1).avecId('S1').construis(),
        ],
        autorisations: [
          uneAutorisation().deProprietaire(unUUID('1'), 'S1').construis(),
        ],
      });
      depot = DepotDonneesParcoursUtilisateur.creeDepot({
        adaptateurPersistance,
        busEvenements: busEvenements as unknown as BusEvenements,
        referentiel,
      });

      const parcours = await depot.lisParcoursUtilisateur(unUUID('1'));

      expect(parcours.explicationNouveauReferentiel.versionsService).toEqual([
        VersionService.v1,
      ]);
    });
  });

  describe('sur demande de marquer vu le tableau de bord', () => {
    it('marque le tableau de bord comme vu', async () => {
      await depot.marqueTableauDeBordVuDansParcoursUtilisateur(unUUID('1'));

      const parcoursAJour = await depot.lisParcoursUtilisateur(unUUID('1'));
      expect(
        parcoursAJour.explicationNouveauReferentiel
          .aVuTableauDeBordDepuisConnexion
      ).toBe(true);
    });

    it('ne persiste pas le parcours si le tableau de bord était déjà vu', async () => {
      await depot.sauvegardeParcoursUtilisateur(
        new ParcoursUtilisateur(donneesParcoursUtilisateur())
      );
      let persistanceAppelee = false;
      adaptateurPersistance.sauvegardeParcoursUtilisateur = async () => {
        persistanceAppelee = true;
      };

      await depot.marqueTableauDeBordVuDansParcoursUtilisateur(unUUID('1'));

      expect(persistanceAppelee).toBe(false);
    });
  });
});
