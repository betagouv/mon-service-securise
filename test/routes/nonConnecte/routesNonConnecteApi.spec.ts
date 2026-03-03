import jwt from 'jsonwebtoken';
import testeurMSS from '../testeurMSS.js';
import {
  ErreurEmailManquant,
  ErreurJWTInvalide,
  ErreurJWTManquant,
  ErreurUtilisateurExistant,
} from '../../../src/erreurs.js';
import { unUtilisateur } from '../../constructeurs/constructeurUtilisateur.js';
import { uneChaineDeCaracteres } from '../../constructeurs/String.js';
import { CorpsRequetePutOuPostUtilisateur } from '../../../src/routes/mappeur/utilisateur.ts';
import Utilisateur from '../../../src/modeles/utilisateur.js';
import { unUUIDRandom } from '../../constructeurs/UUID.ts';
import { UUID } from '../../../src/typesBasiques.ts';

describe('Le serveur MSS des routes publiques /api/*', () => {
  const testeur = testeurMSS();

  beforeEach(() => testeur.initialise());

  describe('quand requête POST sur `/api/utilisateur`', () => {
    const tokenJWT = jwt.sign({ donnees: 'unTokenValide' }, 'secret-jwt');
    const tokenJWTInvalide = jwt.sign(
      { donnees: 'unTokenInvalide' },
      'mauvais-secret-jwt'
    );
    const utilisateur = {
      id: '123',
      genereToken: () => 'un token',
    } as unknown as Utilisateur;
    let donneesRequete: Omit<
      CorpsRequetePutOuPostUtilisateur,
      'nom' | 'prenom'
    > & {
      token: string;
    };

    beforeEach(() => {
      donneesRequete = {
        telephone: '0100000000',
        postes: ['RSSI', "Chargé des systèmes d'informations"],
        siretEntite: '13000766900018',
        estimationNombreServices: {
          borneBasse: '1',
          borneHaute: '10',
        },
        cguAcceptees: true,
        infolettreAcceptee: true,
        transactionnelAccepte: true,
        token: tokenJWT,
      };

      testeur.adaptateurJWT().decode = (token: string) => {
        if (token === tokenJWT)
          return {
            prenom: 'Jean',
            nom: 'Dupont',
            email: 'jean.dupont@mail.fr',
          };
        if (token === tokenJWTInvalide) {
          throw new ErreurJWTInvalide();
        }
        throw new ErreurJWTManquant();
      };
      testeur.referentiel().departement = () => 'Paris';
      testeur.adaptateurMail().creeContact = () => Promise.resolve();
      testeur.adaptateurMail().envoieMessageFinalisationInscription = () =>
        Promise.resolve();
      testeur.adaptateurMail().envoieMessageReinitialisationMotDePasse = () =>
        Promise.resolve();

      testeur.depotDonnees().nouvelUtilisateur = () =>
        Promise.resolve(utilisateur);
    });

    it('applique une protection de trafic', async () => {
      await testeur.middleware().verifieProtectionTrafic(testeur.app(), {
        method: 'post',
        url: '/api/utilisateur',
      });
    });

    describe('concernant la validation des données de la requête', () => {
      it('accepte une payload correcte', async () => {
        const reponse = await testeur.post('/api/utilisateur', donneesRequete);

        expect(reponse.status).toEqual(200);
      });

      it.each([
        { valeurErronee: '01234567890' },
        { valeurErronee: '1234567890' },
        { valeurErronee: '012345678' },
      ])(
        'renvoie une erreur 400 car $valeurErronee est une valeur invalide pour le téléphone',
        async ({ valeurErronee }) => {
          donneesRequete.telephone = valeurErronee;

          const reponse = await testeur.post(
            '/api/utilisateur',
            donneesRequete
          );

          expect(reponse.status).toEqual(400);
        }
      );

      it.each([
        { valeurValide: '0123456789' },
        { valeurValide: '' },
        { valeurValide: undefined },
      ])(
        'accepte $valeurValide comme valeur valide pour le téléphone',
        async ({ valeurValide }) => {
          donneesRequete.telephone = valeurValide;

          const reponse = await testeur.post(
            '/api/utilisateur',
            donneesRequete
          );

          expect(reponse.status).toEqual(200);
        }
      );

      it.each([
        { valeurErronee: false },
        { valeurErronee: '1' },
        { valeurErronee: undefined },
      ])(
        "renvoie une erreur 400 car $valeurErronee est une valeur invalide pour l'acceptation des CGU",
        async ({ valeurErronee }) => {
          // @ts-expect-error On force des "mauvaises" valeurs pour tester la validation
          donneesRequete.cguAcceptees = valeurErronee;

          const reponse = await testeur.post(
            '/api/utilisateur',
            donneesRequete
          );

          expect(reponse.status).toEqual(400);
        }
      );

      it.each([{ valeurErronee: '1' }, { valeurErronee: undefined }])(
        "renvoie une erreur 400 car $valeurErronee est une valeur invalide pour l'acceptation de l'infolettre",
        async ({ valeurErronee }) => {
          // @ts-expect-error On force des "mauvaises" valeurs pour tester la validation
          donneesRequete.infolettreAcceptee = valeurErronee;

          const reponse = await testeur.post(
            '/api/utilisateur',
            donneesRequete
          );

          expect(reponse.status).toEqual(400);
        }
      );

      it.each([{ valeurErronee: '1' }, { valeurErronee: undefined }])(
        "renvoie une erreur 400 car $valeurErronee est une valeur invalide pour l'acceptation du transactionnel",
        async ({ valeurErronee }) => {
          // @ts-expect-error On force des "mauvaises" valeurs pour tester la validation
          donneesRequete.transactionnelAccepte = valeurErronee;

          const reponse = await testeur.post(
            '/api/utilisateur',
            donneesRequete
          );

          expect(reponse.status).toEqual(400);
        }
      );

      it.each([
        { valeurErronee: [] },
        { valeurErronee: [uneChaineDeCaracteres(201, 'a')] },
        {
          valeurErronee: [
            'poste1',
            'poste2',
            'poste3',
            'poste4',
            'poste5',
            'poste6',
            'poste7',
            'poste8',
            'poste9',
          ],
        },
      ])(
        "renvoie une erreur 400 car $valeurErronee est une valeur invalide pour l'acceptation du transactionnel",
        async ({ valeurErronee }) => {
          donneesRequete.postes = valeurErronee;

          const reponse = await testeur.post(
            '/api/utilisateur',
            donneesRequete
          );

          expect(reponse.status).toEqual(400);
        }
      );

      it.each([
        { valeurErronee: { borneBasse: '10', borneHaute: '42' } },
        { valeurErronee: undefined },
      ])(
        "renvoie une erreur 400 car $valeurErronee est une valeur invalide pour l'acceptation du transactionnel",
        async ({ valeurErronee }) => {
          // @ts-expect-error On force des "mauvaises" valeurs pour tester la validation
          donneesRequete.estimationNombreServices = valeurErronee;

          const reponse = await testeur.post(
            '/api/utilisateur',
            donneesRequete
          );

          expect(reponse.status).toEqual(400);
        }
      );

      it.each([
        { valeurValide: { borneBasse: '1', borneHaute: '10' } },
        { valeurValide: { borneBasse: '10', borneHaute: '49' } },
        { valeurValide: { borneBasse: '50', borneHaute: '99' } },
        { valeurValide: { borneBasse: '100', borneHaute: '100' } },
        { valeurValide: { borneBasse: '-1', borneHaute: '-1' } },
      ])(
        'accepte les valeurs de bornes prédéfinies',
        async ({ valeurValide }) => {
          // @ts-expect-error On force des "vraies" valeurs pour tester la validation
          donneesRequete.estimationNombreServices = valeurValide;

          const reponse = await testeur.post(
            '/api/utilisateur',
            donneesRequete
          );

          expect(reponse.status).toEqual(200);
        }
      );

      it.each([{ valeurErronee: '1234' }, { valeurErronee: undefined }])(
        'renvoie une erreur 400 car $valeurErronee est une valeur invalide pour le siret',
        async ({ valeurErronee }) => {
          // @ts-expect-error On force des "mauvaises" valeurs pour tester la validation
          donneesRequete.siretEntite = valeurErronee;

          const reponse = await testeur.post(
            '/api/utilisateur',
            donneesRequete
          );

          expect(reponse.status).toEqual(400);
        }
      );

      it.each([{ valeurErronee: '' }, { valeurErronee: undefined }])(
        'renvoie une erreur 400 car $valeurErronee est une valeur invalide pour le token',
        async ({ valeurErronee }) => {
          // @ts-expect-error On force des "mauvaises" valeurs pour tester la validation
          donneesRequete.token = valeurErronee;

          const reponse = await testeur.post(
            '/api/utilisateur',
            donneesRequete
          );

          expect(reponse.status).toEqual(400);
        }
      );

      it('accepte un paramètre optionnel agentConnect à true', async () => {
        donneesRequete.agentConnect = true;

        const reponse = await testeur.post('/api/utilisateur', donneesRequete);

        expect(reponse.status).toEqual(200);
      });

      it('renvoie une erreur 400 si un paramètre est en trop', async () => {
        // @ts-expect-error On force des "mauvaises" valeurs pour tester la validation
        donneesRequete.unParametreInconnu = 'hello';

        const reponse = await testeur.post('/api/utilisateur', donneesRequete);

        expect(reponse.status).toEqual(400);
      });
    });

    it("convertit l'email en minuscules", async () => {
      testeur.depotDonnees().nouvelUtilisateur = ({
        email,
      }: {
        email: string;
      }) => {
        expect(email).toEqual('jean.dupont@mail.fr');
        return Promise.resolve(utilisateur);
      };

      testeur.adaptateurJWT().decode = () => ({
        prenom: 'Jean',
        nom: 'Dupont',
        email: 'Jean.DUPONT@mail.fr',
      });

      await testeur.post('/api/utilisateur', donneesRequete);
    });

    it('si les CGU sont acceptées, passe la valeur de la version actuelle des CGU au dépôt', async () => {
      let cguRecues;
      testeur.referentiel().recharge({ versionActuelleCgu: 'v2.0' });
      testeur.depotDonnees().nouvelUtilisateur = async ({
        cguAcceptees,
      }: {
        cguAcceptees: boolean;
      }) => {
        cguRecues = cguAcceptees;
        return utilisateur;
      };

      donneesRequete.cguAcceptees = true;

      await testeur.post('/api/utilisateur', donneesRequete);

      expect(cguRecues).toBe('v2.0');
    });

    it("convertit l'infolettre acceptée en valeur booléenne", async () => {
      testeur.depotDonnees().nouvelUtilisateur = ({
        infolettreAcceptee,
      }: {
        infolettreAcceptee: true;
      }) => {
        expect(infolettreAcceptee).toEqual(true);
        return Promise.resolve(utilisateur);
      };

      donneesRequete.infolettreAcceptee = true;

      await testeur.post('/api/utilisateur', donneesRequete);
    });

    it("demande au dépôt de créer l'utilisateur", async () => {
      let donneesRecues;
      testeur.depotDonnees().nouvelUtilisateur = async (
        donneesUtilisateur: CorpsRequetePutOuPostUtilisateur
      ) => {
        donneesRecues = donneesUtilisateur;
        return unUtilisateur().avecId('123').construis();
      };

      const reponse = await testeur.post('/api/utilisateur', donneesRequete);

      expect(reponse.status).toEqual(200);
      expect(reponse.body).toEqual({ idUtilisateur: '123' });
      expect(donneesRecues).toEqual({
        prenom: 'Jean',
        nom: 'Dupont',
        telephone: '0100000000',
        entite: {
          siret: '13000766900018',
        },
        estimationNombreServices: {
          borneBasse: '1',
          borneHaute: '10',
        },
        infolettreAcceptee: true,
        transactionnelAccepte: true,
        postes: ['RSSI', "Chargé des systèmes d'informations"],
        cguAcceptees: true,
        email: 'jean.dupont@mail.fr',
      });
    });

    it("utilise l'adaptateur de tracking pour envoyer un événement d'inscription", async () => {
      testeur.depotDonnees().nouvelUtilisateur = () =>
        Promise.resolve({ email: 'jean.dupont@mail.fr' });

      let donneesPassees = {};
      testeur.adaptateurTracking().envoieTrackingInscription = (
        destinataire: string
      ) => {
        donneesPassees = { destinataire };
        return Promise.resolve();
      };

      await testeur.post('/api/utilisateur', donneesRequete);

      expect(donneesPassees).toEqual({
        destinataire: 'jean.dupont@mail.fr',
      });
    });

    it('crée un contact email', async () => {
      testeur.adaptateurMail().creeContact = (
        destinataire: string,
        prenom: string,
        nom: string,
        telephone: string,
        bloqueEmails: boolean,
        bloqueMarketing: boolean
      ) => {
        expect(destinataire).toEqual('jean.dupont@mail.fr');
        expect(prenom).toEqual('Jean');
        expect(nom).toEqual('Dupont');
        expect(telephone).toEqual('0100000000');
        expect(bloqueEmails).toEqual(false);
        expect(bloqueMarketing).toBe(false);
        return Promise.resolve();
      };

      await testeur.post('/api/utilisateur', donneesRequete);
    });

    it("envoie un message de notification à l'utilisateur créé", async () => {
      utilisateur.email = 'jean.dupont@mail.fr';

      testeur.adaptateurMail().envoieMessageFinalisationInscription = (
        destinataire: string
      ) => {
        expect(destinataire).toEqual('jean.dupont@mail.fr');
        return Promise.resolve();
      };

      await testeur.post('/api/utilisateur', donneesRequete);
    });

    it("n'envoie pas de message de notification à l'utilisateur Agent Connect créé", async () => {
      testeur.adaptateurMail().envoieMessageFinalisationInscription = () => {
        expect.fail("N'aurait pas dû envoyer de message");
      };

      await testeur.post('/api/utilisateur', {
        ...donneesRequete,
        agentConnect: true,
      });
    });

    describe("si l'envoi de mail échoue", () => {
      beforeEach(() => {
        testeur.adaptateurMail().envoieMessageFinalisationInscription = () =>
          Promise.reject(new Error('Oups.'));
        testeur.depotDonnees().supprimeUtilisateur = () => Promise.resolve();
      });

      it('retourne une erreur HTTP 424', async () => {
        await testeur.verifieRequeteGenereErreurHTTP(
          424,
          "L'envoi de l'email de finalisation d'inscription a échoué",
          {
            method: 'post',
            url: '/api/utilisateur',
            data: donneesRequete,
          }
        );
      });
    });

    it('envoie un email de notification de tentative de réinscription', async () => {
      let notificationEnvoyee = false;

      testeur.depotDonnees().nouvelUtilisateur = () =>
        Promise.reject(new ErreurUtilisateurExistant('oups', unUUIDRandom()));

      testeur.adaptateurMail().envoieNotificationTentativeReinscription = (
        destinataire: string
      ) => {
        expect(destinataire).toEqual('jean.dupont@mail.fr');
        notificationEnvoyee = true;
        return Promise.resolve();
      };

      await testeur.post('/api/utilisateur', donneesRequete);

      expect(notificationEnvoyee).toBe(true);
    });

    it("génère une erreur HTTP 422 si l'email n'est pas renseigné", async () => {
      testeur.depotDonnees().nouvelUtilisateur = async () => {
        throw new ErreurEmailManquant('oups');
      };

      await testeur.verifieRequeteGenereErreurHTTP(422, 'oups', {
        method: 'post',
        url: '/api/utilisateur',
        data: donneesRequete,
      });
    });

    it('jette une erreur si le token est invalide', async () => {
      donneesRequete.token = tokenJWTInvalide;
      const { status } = await testeur.post('/api/utilisateur', donneesRequete);

      expect(status).toBe(422);
    });
  });

  describe('quand requête GET sur `/api/annuaire/organisations`', () => {
    beforeEach(() => {
      testeur.referentiel().estCodeDepartement = () => true;
    });

    it.each([{ valeurIncorrecte: '7500' }, { valeurIncorrecte: 'abcd' }])(
      'renvoie une erreur 400 car $valeurErronee est une valeur invalide pour le département',
      async ({ valeurIncorrecte }) => {
        testeur.serviceAnnuaire().rechercheOrganisations = async () => {};

        const reponse = await testeur.get(
          `/api/annuaire/organisations?recherche=mairie&departement=${valeurIncorrecte}`
        );

        expect(reponse.status).toEqual(400);
      }
    );

    it.each([
      { valeurIncorrecte: '' },
      { valeurIncorrecte: 'a' },
      { valeurIncorrecte: uneChaineDeCaracteres(201, 'a') },
    ])(
      'renvoie une erreur 400 car $valeurErronee est une valeur invalide pour la recherche',
      async ({ valeurIncorrecte }) => {
        testeur.serviceAnnuaire().rechercheOrganisations = async () => {};

        const reponse = await testeur.get(
          `/api/annuaire/organisations?recherche=${valeurIncorrecte}&departement=75`
        );

        expect(reponse.status).toEqual(400);
      }
    );

    it("recherche les organisations correspondantes grâce au service d'annuaire", async () => {
      let adaptateurAppele = false;
      testeur.serviceAnnuaire().rechercheOrganisations = (
        terme: string,
        departement: string
      ) => {
        adaptateurAppele = true;
        expect(terme).toEqual('mairie');
        expect(departement).toEqual('01');
        return Promise.resolve([{ nom: 'un résultat', departement: '01' }]);
      };

      const reponse = await testeur.get(
        '/api/annuaire/organisations?recherche=mairie&departement=01'
      );

      expect(adaptateurAppele).toBe(true);
      expect(reponse.status).toBe(200);
      expect(reponse.body.suggestions).toEqual([
        { nom: 'un résultat', departement: '01' },
      ]);
    });
  });

  describe('quand requête POST sur `/api/desinscriptionInfolettre`', () => {
    const donneesRequete = {
      email: 'jean.dujardin@mail.com',
      event: 'unsubscribe',
    };

    it("retourne une erreur HTTP 400 si l'évènement n'est pas une désinscription", async () => {
      const reponse = await testeur.post('/api/desinscriptionInfolettre', {
        email: 'jean.dujardin@mail.com',
        event: 'autre chose',
      });

      expect(reponse.status).toEqual(400);
    });

    it.each([
      { valeurInvalide: '' },
      { valeurInvalide: 'hello.world' },
      { valeurInvalide: undefined },
    ])(
      "retourne une erreur HTTP 400 car $valeurInvalide n'est pas une valeur valide pour l'email",
      async ({ valeurInvalide }) => {
        const reponse = await testeur.post('/api/desinscriptionInfolettre', {
          email: valeurInvalide,
          event: 'unsubscribe',
        });

        expect(reponse.status).toEqual(400);
      }
    );

    it("retourne une erreur HTTP 424 si l'adresse email est introuvable", async () => {
      testeur.depotDonnees().utilisateurAvecEmail = () =>
        Promise.resolve(undefined);

      await testeur.verifieRequeteGenereErreurHTTP(
        424,
        { erreur: "L'email fourni est introuvable" },
        {
          method: 'post',
          url: '/api/desinscriptionInfolettre',
          data: donneesRequete,
        }
      );
    });

    it("vérifie l'adresse IP de la requête", async () => {
      await testeur
        .middleware()
        .verifieAdresseIP(
          ['185.107.232.1/24', '1.179.112.1/20'],
          testeur.app(),
          {
            method: 'post',
            url: '/api/desinscriptionInfolettre',
            data: donneesRequete,
          }
        );
    });

    it("désabonne l'utilisateur des mails marketing", async () => {
      const utilisateur = unUtilisateur()
        .avecId('123')
        .quiAccepteEmailsTransactionnels()
        .construis();
      testeur.depotDonnees().utilisateurAvecEmail = (email: string) => {
        expect(email).toEqual('jean.dujardin@mail.com');
        return Promise.resolve(utilisateur);
      };
      testeur.depotDonnees().metsAJourUtilisateur = (
        id: UUID,
        donnees: Record<string, unknown>
      ) => {
        expect(id).toEqual('123');
        expect(donnees).toEqual({ transactionnelAccepte: false });
        return Promise.resolve();
      };

      await testeur.post('/api/desinscriptionInfolettre', donneesRequete);
    });
  });

  describe('quand requête GET sur `/api/sante`', () => {
    it('applique une protection de trafic', async () => {
      testeur.depotDonnees().santeDuDepot = async () => {};

      await testeur.middleware().verifieProtectionTrafic(testeur.app(), {
        method: 'get',
        url: '/api/sante',
      });
    });

    it("utilise le dépôt de données pour vérifier l'état de santé de la base", async () => {
      let depotAppele = false;
      testeur.depotDonnees().santeDuDepot = () => {
        depotAppele = true;
      };

      const reponse = await testeur.get('/api/sante');

      expect(depotAppele).toBe(true);
      expect(reponse.status).toBe(200);
    });

    it('renvoi une erreur 503 si le dépôt est défectueux', async () => {
      testeur.depotDonnees().santeDuDepot = () => {
        throw new Error();
      };

      const reponse = await testeur.get('/api/sante');

      expect(reponse.status).toBe(503);
    });

    it('loggue une erreur si le dépôt est défectueux', async () => {
      testeur.depotDonnees().santeDuDepot = () => {
        throw new Error();
      };
      let erreurLoguee: Error;
      testeur.adaptateurGestionErreur().logueErreur = (erreur: Error) => {
        erreurLoguee = erreur;
      };

      try {
        await testeur.get('/api/sante');
        expect.fail("L'appel aurait du échouer");
      } catch {
        expect(erreurLoguee!.message).toBe(
          'La base de données est injoignable'
        );
      }
    });

    it('empêche le cache', async () => {
      testeur.depotDonnees().santeDuDepot = () => {};

      const reponse = await testeur.get('/api/sante');

      expect(reponse.headers['surrogate-control']).toBe('no-store');
      expect(reponse.headers['cache-control']).toBe(
        'no-store, no-cache, must-revalidate, proxy-revalidate'
      );
      expect(reponse.headers.expires).toBe('0');
    });
  });
});
