import { expectContenuSessionValide } from '../../aides/cookie.js';
import { SourceAuthentification } from '../../../src/modeles/sourceAuthentification.ts';
import testeurMSS from '../testeurMSS.js';
import { unUtilisateur } from '../../constructeurs/constructeurUtilisateur.js';
import Utilisateur from '../../../src/modeles/utilisateur.js';
import { uneChaineDeCaracteres } from '../../constructeurs/String.ts';
import { UUID } from '../../../src/typesBasiques.ts';
import { CorpsRequetePutOuPostUtilisateur } from '../../../src/routes/mappeur/utilisateur.ts';

describe("Les routes connectées d'API pour l'utilisateur", () => {
  const testeur = testeurMSS();
  let utilisateur: Utilisateur;

  beforeEach(() => testeur.initialise());

  beforeEach(() => {
    utilisateur = {
      id: '123',
      email: 'jean.dujardin@beta.gouv.fr',
      genereToken: (source: SourceAuthentification) =>
        `un token de source ${source}`,
      accepteCGU: () => true,
      estUnInvite: () => false,
    } as unknown as Utilisateur;
  });

  describe('quand requête PUT sur `/api/utilisateur/acceptationCGU`', () => {
    beforeEach(() => {
      const depotDonnees = testeur.depotDonnees();
      depotDonnees.utilisateur = async () => utilisateur;
      depotDonnees.valideAcceptationCGUPourUtilisateur = async () =>
        utilisateur;
      testeur.middleware().reinitialise({
        idUtilisateur: utilisateur.id,
        acceptationCGU: false,
        authentificationAUtiliser: SourceAuthentification.AGENT_CONNECT,
      });
    });

    it("vérifie que l'utilisateur est authentifié", async () => {
      await testeur.middleware().verifieRequeteExigeJWT(testeur.app(), {
        method: 'PUT',
        url: '/api/utilisateur/acceptationCGU',
      });
    });

    it("demande au dépôt d'enregistrer que les CGU sont acceptées", async () => {
      let utilisateurQuiAccepte;
      testeur.depotDonnees().valideAcceptationCGUPourUtilisateur = async (
        u: Utilisateur
      ) => {
        utilisateurQuiAccepte = u;
        return u;
      };

      await testeur.put('/api/utilisateur/acceptationCGU', {
        cguAcceptees: 'true',
      });

      expect(utilisateurQuiAccepte!.id).toBe('123');
    });

    it('ajoute une session utilisateur', async () => {
      const reponse = await testeur.put('/api/utilisateur/acceptationCGU', {
        cguAcceptees: 'true',
      });

      expectContenuSessionValide(reponse, 'AGENT_CONNECT', true, false);
    });
  });

  describe('quand requête PUT sur `/api/utilisateur`', () => {
    let donneesRequete: CorpsRequetePutOuPostUtilisateur;

    beforeEach(() => {
      utilisateur = unUtilisateur().avecId('123').construis();

      donneesRequete = {
        telephone: '0100000000',
        postes: ['RSSI', "Chargé des systèmes d'informations"],
        siretEntite: '13000766900018',
        estimationNombreServices: { borneBasse: '1', borneHaute: '10' },
        infolettreAcceptee: true,
        transactionnelAccepte: true,
        cguAcceptees: true,
      };

      testeur.referentiel().departement = () => 'Paris';
      const depotDonnees = testeur.depotDonnees();
      depotDonnees.metsAJourUtilisateur = async () => utilisateur;
      depotDonnees.utilisateur = async () => utilisateur;
    });

    describe('concernant la validation de la requête', () => {
      it.each([
        { postes: [] },
        { postes: [1] },
        { postes: [uneChaineDeCaracteres(201, 'i')] },
        { postes: Array(9).fill('i') },
      ])(`refuse des postes "$postes"`, async ({ postes }) => {
        donneesRequete.postes = postes;
        const reponse = await testeur.put(`/api/utilisateur`, donneesRequete);
        expect(reponse.status).toBe(400);
      });

      it.each([null, '01 02 03 04 05', '01223344'])(
        `refuse le numéro de téléphone "%s"`,
        async (telephone) => {
          // @ts-expect-error On force des valeurs invalides pour le test.
          donneesRequete.telephone = telephone;
          const reponse = await testeur.put(`/api/utilisateur`, donneesRequete);
          expect(reponse.status).toBe(400);
        }
      );

      it('accepte un numéro de téléphone vide', async () => {
        donneesRequete.telephone = '';
        const reponse = await testeur.put(`/api/utilisateur`, donneesRequete);
        expect(reponse.status).toBe(200);
      });

      it.each([undefined, 'abc', '123456789'])(
        `refuse le SIRET "%s"`,
        async (siret) => {
          // @ts-expect-error On force des valeurs invalides pour le test.
          donneesRequete.siretEntite = siret;
          const reponse = await testeur.put(`/api/utilisateur`, donneesRequete);
          expect(reponse.status).toBe(400);
        }
      );

      it.each([
        {},
        { borneBasse: 1 },
        { borneHaute: 1 },
        { borneBasse: 1, borneHaute: 50 },
        { borneBasse: '1', borneHaute: '50' },
      ])(
        `refuse les estimations de nombre de services "%s"`,
        async (estimation) => {
          // @ts-expect-error On force des valeurs invalides pour le test.
          donneesRequete.estimationNombreServices = estimation;
          const reponse = await testeur.put(`/api/utilisateur`, donneesRequete);
          expect(reponse.status).toBe(400);
        }
      );

      it.each([null, undefined, 'abc', 10])(
        `refuse le transactionnel accepté "%s"`,
        async (transactionnelAccepte) => {
          // @ts-expect-error On force des valeurs invalides pour le test.
          donneesRequete.transactionnelAccepte = transactionnelAccepte;
          const reponse = await testeur.put(`/api/utilisateur`, donneesRequete);
          expect(reponse.status).toBe(400);
        }
      );

      it("valide le champ `token` s'il est présent", async () => {
        // @ts-expect-error On force un valeur invalide pour le test.
        donneesRequete.token = 123;
        const reponse = await testeur.put(`/api/utilisateur`, donneesRequete);
        expect(reponse.status).toBe(400);
      });

      it('accepte une requête avec une source de connexion ProConnect : cas où un invité vient finaliser son incription en ayant suivi le parcours ProConnect', async () => {
        const reponse = await testeur.put('/api/utilisateur', {
          ...donneesRequete,
          agentConnect: true,
        });

        expect(reponse.status).toBe(200);
      });
    });

    it("utilise les saisies de l'utilisateur pour mettre à jour les informations autres que nom/prénom (qui sont extraits du token)", async () => {
      let idRecu;
      let donneesRecues;
      testeur.referentiel().recharge({ versionActuelleCgu: 'v2.0' });
      testeur.middleware().reinitialise({ idUtilisateur: utilisateur.id });
      testeur.depotDonnees().metsAJourUtilisateur = async (
        id: UUID,
        donnees: Utilisateur
      ) => {
        idRecu = id;
        donneesRecues = donnees;
        return utilisateur;
      };

      const reponse = await testeur.put('/api/utilisateur', donneesRequete);

      expect(reponse.status).toEqual(200);
      expect(reponse.body).to.eql({ idUtilisateur: '123' });
      expect(idRecu).toEqual('123');
      expect(donneesRecues!.telephone).toEqual('0100000000');
      expect(donneesRecues!.entite.siret).toEqual('13000766900018');
      expect(donneesRecues!.infolettreAcceptee).toEqual(true);
      expect(donneesRecues!.transactionnelAccepte).toEqual(true);
      expect(donneesRecues!.postes).to.eql([
        'RSSI',
        "Chargé des systèmes d'informations",
      ]);
    });

    it("utilise le nom et le prénom du token, s'il est présent (cas de finalisation d'inscription ; il est absent si l'utilisateur est sur sa page profil)", async () => {
      let donneesRecues;
      testeur.adaptateurJWT().decode = () => ({
        prenom: 'Jean Token',
        nom: 'Dupont Token',
        email: 'jean.token@beta.gouv.fr',
      });
      testeur.depotDonnees().metsAJourUtilisateur = async (
        _: UUID,
        donnees: Utilisateur
      ) => {
        donneesRecues = donnees;
        return utilisateur;
      };

      donneesRequete.token = 'un-token-jwt';
      await testeur.put('/api/utilisateur', donneesRequete);

      expect(donneesRecues!.prenom).toEqual('Jean Token');
      expect(donneesRecues!.nom).toEqual('Dupont Token');
    });

    it('jette une erreur si le token est présent mais invalide', async () => {
      testeur.adaptateurJWT().decode = () => {
        throw new Error('Token invalide');
      };

      donneesRequete.token = 'un-token-jwt-invalide';
      const { status } = await testeur.put('/api/utilisateur', donneesRequete);

      expect(status).toBe(422);
    });

    describe("concernant l'acceptation des CGU", () => {
      it("quand l'acception des CGU est présente dans la payload (cas d'un invité qui confirme son compte) alors c'est version actuelle des CGU qui est passée au dépôt de données", async () => {
        let versionCGURecue;
        testeur.referentiel().recharge({ versionActuelleCgu: 'v2.0' });
        testeur.depotDonnees().metsAJourUtilisateur = async (
          _: UUID,
          donnees: Utilisateur
        ) => {
          versionCGURecue = donnees.cguAcceptees;
          return utilisateur;
        };

        await testeur.put('/api/utilisateur', donneesRequete);

        expect(versionCGURecue).toBe('v2.0');
      });

      it("quand l'acceptation des CGU n'est *pas* dans la payload, alors aucune info concernant les CGU n'est passée au dépôt de données", async () => {
        let versionCGURecue;
        testeur.depotDonnees().metsAJourUtilisateur = async (
          _: UUID,
          donnees: Utilisateur
        ) => {
          versionCGURecue = donnees.cguAcceptees;
          return utilisateur;
        };
        delete donneesRequete.cguAcceptees;

        await testeur.put('/api/utilisateur', donneesRequete);

        expect(versionCGURecue).toBe(undefined);
      });
    });

    it("met à jour les préférences de communication de l'utilisateur", async () => {
      let preferencesChangees;
      testeur.middleware().reinitialise({ idUtilisateur: utilisateur.id });

      testeur.depotDonnees().utilisateur = async () => {
        const u = unUtilisateur().construis();

        u.changePreferencesCommunication = async (nouvellesPreferences) => {
          preferencesChangees = nouvellesPreferences;
        };

        return u;
      };

      donneesRequete.infolettreAcceptee = true;
      donneesRequete.transactionnelAccepte = true;
      await testeur.put('/api/utilisateur', donneesRequete);

      expect(preferencesChangees).to.eql({
        infolettreAcceptee: true,
        transactionnelAccepte: true,
      });
    });
  });

  describe('quand requête GET sur `/api/utilisateurCourant`', () => {
    it("renvoie des infos de l'utilisateur correspondant à l'identifiant", async () => {
      testeur.middleware().reinitialise({ idUtilisateur: '123' });
      let idUtilisateurRecu = null;
      const depotDonnees = testeur.depotDonnees();
      depotDonnees.utilisateur = async (idUtilisateur: UUID) => {
        idUtilisateurRecu = idUtilisateur;
        return unUtilisateur()
          .quiSAppelle('Marie Jeanne')
          .quiTravaillePourUneEntiteAvecSiret('12345')
          .construis();
      };

      const reponse = await testeur.get('/api/utilisateurCourant');

      expect(reponse.status).toEqual(200);
      expect(idUtilisateurRecu).toEqual('123');
      const { utilisateur: courant } = reponse.body;
      expect(courant.prenomNom).toEqual('Marie Jeanne');
    });

    it("renvoie la source d'authentification", async () => {
      testeur.middleware().reinitialise({
        idUtilisateur: '123',
        authentificationAUtiliser: SourceAuthentification.AGENT_CONNECT,
      });
      const depotDonnees = testeur.depotDonnees();
      depotDonnees.utilisateur = async () => unUtilisateur().construis();

      const reponse = await testeur.get('/api/utilisateurCourant');

      const { sourceAuthentification } = reponse.body;
      expect(sourceAuthentification).toEqual('AGENT_CONNECT');
    });

    it("répond avec un code 401 quand il n'y a pas d'identifiant", async () => {
      testeur.middleware().reinitialise({ idUtilisateur: '' });

      const reponse = await testeur.get('/api/utilisateurCourant');
      expect(reponse.status).toEqual(401);
    });
  });
});
