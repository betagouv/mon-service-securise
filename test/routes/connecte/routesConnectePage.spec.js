import expect from 'expect.js';
import testeurMSS from '../testeurMSS.js';
import { unUtilisateur } from '../../constructeurs/constructeurUtilisateur.js';
import { donneesPartagees } from '../../aides/http.js';
import Superviseur from '../../../src/modeles/superviseur.js';
import {
  verifieNomFichierServi,
  verifieTypeFichierServiEstCSV,
} from '../../aides/verifieFichierServi.js';

describe('Le serveur MSS des pages pour un utilisateur "Connecté"', () => {
  const testeur = testeurMSS();

  beforeEach(testeur.initialise);

  describe(`quand GET sur /motDePasse/initialisation`, () => {
    beforeEach(() => {
      const utilisateur = unUtilisateur().construis();
      testeur.depotDonnees().utilisateur = async () => utilisateur;
    });

    it("vérifie que l'utilisateur est authentifié", async () => {
      await testeur
        .middleware()
        .verifieRequeteExigeJWT(testeur.app(), '/motDePasse/initialisation');
    });

    it('sert le contenu HTML de la page', async () => {
      const reponse = await testeur.get('/motDePasse/initialisation');

      expect(reponse.status).to.equal(200);
      expect(reponse.headers['content-type']).to.contain('text/html');
    });
  });

  [
    '/motDePasse/edition',
    '/profil',
    '/tableauDeBord',
    '/visiteGuidee/decrire',
    '/visiteGuidee/securiser',
    '/visiteGuidee/homologuer',
    '/visiteGuidee/piloter',
    '/mesures',
  ].forEach((route) => {
    describe(`quand GET sur ${route}`, () => {
      beforeEach(() => {
        const utilisateur = unUtilisateur().construis();
        testeur.depotDonnees().utilisateur = async () => utilisateur;
        testeur.depotDonnees().rafraichisProfilUtilisateurLocal =
          async () => {};
        testeur.referentiel().recharge({
          etapesParcoursHomologation: [{ numero: 1 }],
        });
      });

      it("vérifie que l'utilisateur a accepté les CGU", async () => {
        await testeur
          .middleware()
          .verifieRequeteExigeAcceptationCGU(testeur.app(), `${route}`);
      });

      it("vérifie que l'état de la visite guidée est chargé sur la route", async () => {
        await testeur
          .middleware()
          .verifieRequeteChargeEtatVisiteGuidee(testeur.app(), `${route}`);
      });

      it('sert le contenu HTML de la page', async () => {
        const reponse = await testeur.get(`${route}`);

        expect(reponse.status).to.equal(200);
        expect(reponse.headers['content-type']).to.contain('text/html');
      });
    });
  });

  describe('quand requête GET sur `/visiteGuidee/:idEtape`', () => {
    it("charge les préférences de l'utilisateur", async () => {
      await testeur
        .middleware()
        .verifieChargementDesPreferences(
          testeur.app(),
          '/visiteGuidee/decrire'
        );
    });
  });

  describe('quand requête GET sur `/deconnexion', () => {
    describe("en tant qu'utilisateur connecté avec MSS", () => {
      it('redirige vers /connexion', async () => {
        testeur.middleware().reinitialise({ authentificationAUtiliser: 'MSS' });

        const reponse = await testeur.get('/deconnexion');

        expect(reponse.status).to.be(302);
        expect(reponse.headers.location).to.be('/connexion');
      });
    });
    describe("en tant qu'utilisateur connecté avec Agent Connect", () => {
      it('redirige vers /oidc/deconnexion', async () => {
        testeur
          .middleware()
          .reinitialise({ authentificationAUtiliser: 'AGENT_CONNECT' });

        const reponse = await testeur.get('/deconnexion');

        expect(reponse.status).to.be(302);
        expect(reponse.headers.location).to.be('/oidc/deconnexion');
      });
    });
  });

  describe(`quand GET sur /profil`, () => {
    beforeEach(() => {
      testeur.depotDonnees().rafraichisProfilUtilisateurLocal =
        async () => ({});
      testeur.depotDonnees().utilisateur = () =>
        unUtilisateur().avecId('456').construis();
    });

    it("délègue au dépôt de données la lecture des informations de l'utilisateur", async () => {
      testeur.middleware().reinitialise({ idUtilisateur: '456' });
      let idRecu;
      testeur.depotDonnees().utilisateur = (idUtilisateur) => {
        idRecu = idUtilisateur;
        return unUtilisateur().construis();
      };

      await testeur.get(`/profil`);
      expect(idRecu).to.be('456');
    });

    it("renvoie l'entité si celle-ci est définie", async () => {
      testeur.middleware().reinitialise({ idUtilisateur: '456' });
      testeur.depotDonnees().utilisateur = () =>
        unUtilisateur().quiTravaillePourUneEntiteAvecSiret('1234').construis();

      const reponse = await testeur.get(`/profil`);

      expect(donneesPartagees(reponse.text, 'donnees-profil').entite).to.eql({
        siret: '1234',
        nom: '',
        departement: '',
      });
    });

    it("renvoie undefined pour l'entité si celle-ci n'est pas définie", async () => {
      testeur.middleware().reinitialise({ idUtilisateur: '456' });
      testeur.depotDonnees().utilisateur = () =>
        unUtilisateur().sansEntite().construis();

      const reponse = await testeur.get(`/profil`);

      expect(donneesPartagees(reponse.text, 'donnees-profil').entite).to.be(
        undefined
      );
    });

    it("reste robuste si l'utilisateur n'a pas de postes, qui est possible si l'utilisateur n'a jamais fini de remplir son profil", async () => {
      testeur.middleware().reinitialise({ idUtilisateur: '456' });
      testeur.depotDonnees().utilisateur = () =>
        unUtilisateur().avecPostes(null).construis();

      const reponse = await testeur.get(`/profil`);

      const donneesUtilisateur = donneesPartagees(
        reponse.text,
        'donnees-profil'
      ).utilisateur;
      expect(donneesUtilisateur.postes).to.eql([]);
    });

    it('rafraîchis les données avec le Profil ANSSI', async () => {
      let depotAppele = false;
      testeur.depotDonnees().rafraichisProfilUtilisateurLocal = async () => {
        depotAppele = true;
      };

      await testeur.get(`/profil`);
      expect(depotAppele).to.be(true);
    });
  });

  describe('quand GET sur /tableauDeBord', () => {
    it("ajoute la donnée partagée indiquant si l'utilisateur est superviseur", async () => {
      testeur.depotDonnees().estSuperviseur = async () => true;

      const reponse = await testeur.get(`/tableauDeBord`);

      const donnees = donneesPartagees(reponse.text, 'utilisateur-superviseur');
      expect(donnees).to.eql({ estSuperviseur: true });
    });

    it("vérifie que l'état de l'explication du nouveau référentiel est chargé", async () => {
      await testeur
        .middleware()
        .verifieRequeteChargeExplicationNouveauReferentiel(
          testeur.app(),
          '/tableauDeBord'
        );
    });

    it("délègue au dépôt de données la mise à jour du fait que l'utilisateur a vu le tableau de bord depuis sa connexion", async () => {
      let idRecu;
      testeur.middleware().reinitialise({ idUtilisateur: '123' });
      testeur.depotDonnees().marqueTableauDeBordVuDansParcoursUtilisateur =
        async (idUtilisateur) => {
          idRecu = idUtilisateur;
        };

      await testeur.get(`/tableauDeBord`);

      expect(idRecu).to.be('123');
    });
  });

  describe('quand GET sur /supervision', () => {
    beforeEach(() => {
      testeur.depotDonnees().superviseur = async () => {};
    });

    it("vérifie que l'utilisateur a accepté les CGU", async () => {
      await testeur
        .middleware()
        .verifieRequeteExigeAcceptationCGU(testeur.app(), `/supervision`);
    });

    it("renvoie une erreur 401 si l'utilisateur n'est pas un superviseur", async () => {
      testeur.depotDonnees().superviseur = async () => undefined;

      const reponse = await testeur.get(`/supervision`);

      expect(reponse.status).to.be(401);
    });

    it("insère les entités supervisées dans la page si l'utilisateur est superviseur", async () => {
      testeur.middleware().reinitialise({ idUtilisateur: '456' });
      testeur.depotDonnees().superviseur = async () =>
        new Superviseur({
          entitesSupervisees: [{ nom: 'MonEntite' }],
        });

      const reponse = await testeur.get(`/supervision`);

      const donnees = donneesPartagees(reponse.text, 'entites-supervisees');
      expect(donnees.length).to.be(1);
      expect(donnees[0].nom).to.be('MonEntite');
    });
  });

  describe('quand GET sur /mesures/export.csv', () => {
    beforeEach(() => {
      testeur.adaptateurCsv().genereCsvMesures = async () => Buffer.from('');
      testeur.middleware().reinitialise({ idUtilisateur: 'U1' });
    });

    it("vérifie que l'utilisateur a accepté les CGU", async () => {
      await testeur
        .middleware()
        .verifieRequeteExigeAcceptationCGU(
          testeur.app(),
          `/mesures/export.csv`
        );
    });

    it('utilise un adaptateur CSV pour la génération', async () => {
      let donneesRecues;
      testeur.referentiel().recharge({
        mesures: {
          uneMesure: {},
        },
      });
      testeur.adaptateurCsv().genereCsvMesures = async (
        donneesMesures,
        contributeurs,
        avecDonneesAdditionnnelles,
        _,
        avecTypeMesure
      ) => {
        donneesRecues = {
          donneesMesures,
          contributeurs,
          avecDonneesAdditionnnelles,
          avecTypeMesure,
        };
      };

      await testeur.get('/mesures/export.csv');

      expect(donneesRecues.avecDonneesAdditionnnelles).to.be(false);
      expect(donneesRecues.avecTypeMesure).to.be(false);
      expect(donneesRecues.contributeurs).to.eql([]);
      expect(donneesRecues.donneesMesures.mesuresSpecifiques).to.eql([]);
      expect(donneesRecues.donneesMesures.mesuresGenerales).to.eql({
        uneMesure: {},
      });
    });

    it('sert un fichier de type CSV', async () => {
      await verifieTypeFichierServiEstCSV(testeur.app(), '/mesures/export.csv');
    });

    it('nomme le fichier CSV referentiel-mesures-MSS.csv', async () => {
      await verifieNomFichierServi(
        testeur.app(),
        '/mesures/export.csv',
        'referentiel-mesures-MSS.csv'
      );
    });

    it("reste robuste en cas d'erreur de génération CSV", async () => {
      testeur.adaptateurCsv().genereCsvMesures = async () => {
        throw Error('BOOM');
      };

      const reponse = await testeur.get('/mesures/export.csv');

      expect(reponse.status).to.be(424);
    });

    it("logue l'erreur survenue le cas échéant", async () => {
      let erreurLoguee;

      testeur.adaptateurCsv().genereCsvMesures = async () => {
        throw Error('BOOM');
      };
      testeur.adaptateurGestionErreur().logueErreur = (erreur) => {
        erreurLoguee = erreur;
      };

      await testeur.get('/mesures/export.csv');

      expect(erreurLoguee).to.be.an(Error);
    });

    it("lis les modèles de mesure spécifique pour l'utilisateur", async () => {
      let idRecu;
      testeur.depotDonnees().lisModelesMesureSpecifiquePourUtilisateur = async (
        idUtilisateur
      ) => {
        idRecu = idUtilisateur;
        return [{ description: 'Un modèle de mesure spécifique' }];
      };

      let donneesModelesMesureSpecifique;
      testeur.adaptateurCsv().genereCsvMesures = async (donneesMesures) => {
        donneesModelesMesureSpecifique = donneesMesures.mesuresSpecifiques;
      };

      await testeur.get('/mesures/export.csv');

      expect(idRecu).to.be('U1');
      expect(donneesModelesMesureSpecifique.length).to.be(1);
      expect(donneesModelesMesureSpecifique[0].description).to.be(
        'Un modèle de mesure spécifique'
      );
    });

    it("utilise les mesures du référentiel v2 si c'est demandé", async () => {
      let donneesMesuresRecues;
      testeur.adaptateurCsv().genereCsvMesures = async (donneesMesures) => {
        donneesMesuresRecues = donneesMesures;
      };

      await testeur.get('/mesures/export.csv?version=v2');

      expect(
        Object.keys(donneesMesuresRecues.mesuresGenerales).includes(
          'RECENSEMENT.1'
        )
      ).to.be(true);
    });
  });
});
