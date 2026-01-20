import testeurMSS from '../testeurMSS.js';
import { unDossier } from '../../constructeurs/constructeurDossier.js';
import { unService } from '../../constructeurs/constructeurService.js';
import Service from '../../../src/modeles/service.js';
import {
  Permissions,
  Rubriques,
} from '../../../src/modeles/autorisations/gestionDroits.js';
import { Autorisation } from '../../../src/modeles/autorisations/autorisation.js';
import * as Referentiel from '../../../src/referentiel.js';
import { UUID } from '../../../src/typesBasiques.js';
import Dossier from '../../../src/modeles/dossier.js';
import { unUUIDRandom } from '../../constructeurs/UUID.js';

const { ECRITURE } = Permissions;
const { HOMOLOGUER } = Rubriques;

describe('Le serveur MSS des routes /api/service/*', () => {
  const testeur = testeurMSS();

  beforeEach(() => testeur.initialise());

  describe('quand requête PUT sur /api/service/:id/homologation/autorite', () => {
    beforeEach(() => {
      const serviceAvecDossier = new Service({
        id: '456',
        descriptionService: { nomService: 'un service' },
        dossiers: [{ id: '999' }],
      });
      testeur
        .middleware()
        // @ts-expect-error La méthode `reinitialise` devrait prendre des paramètres optionnels
        .reinitialise({ serviceARenvoyer: serviceAvecDossier });
      testeur.depotDonnees().enregistreDossier = async () => {};
    });

    it('recherche le service correspondant', async () => {
      await testeur
        .middleware()
        .verifieRechercheService(
          [{ niveau: ECRITURE, rubrique: HOMOLOGUER }],
          testeur.app(),
          {
            url: '/api/service/456/homologation/autorite',
            method: 'put',
          }
        );
    });

    it('recherche le dossier courant correspondant', async () => {
      await testeur.middleware().verifieRechercheDossierCourant(testeur.app(), {
        url: '/api/service/456/homologation/autorite',
        method: 'put',
      });
    });

    it('jette une erreur si le nom est invalide', async () => {
      const { status } = await testeur.put(
        '/api/service/456/homologation/autorite',
        { nom: undefined, fonction: 'RSSI' }
      );

      expect(status).toBe(400);
    });

    it('jette une erreur si la fonction est invalide', async () => {
      const { status } = await testeur.put(
        '/api/service/456/homologation/autorite',
        { nom: 'Jean Duj', fonction: undefined }
      );

      expect(status).toBe(400);
    });

    it("utilise le dépôt pour enregistrer l'autorité d'homologation", async () => {
      let depotAppele = false;

      testeur.depotDonnees().enregistreDossier = async (
        idHomologation: UUID,
        dossier: Dossier
      ) => {
        depotAppele = true;
        expect(idHomologation).toEqual('456');
        expect(dossier.autorite.nom).toEqual('Jean Dupond');
        expect(dossier.autorite.fonction).toEqual('RSSI');
      };

      await testeur.put('/api/service/456/homologation/autorite', {
        nom: 'Jean Dupond',
        fonction: 'RSSI',
      });

      expect(depotAppele).toBe(true);
    });
  });

  describe('quand requête PUT sur /api/service/:id/homologation/decision', () => {
    beforeEach(() => {
      const serviceAvecDossier = new Service({
        id: '456',
        descriptionService: { nomService: 'un service' },
        dossiers: [{ id: '999' }],
      });
      testeur
        .middleware()
        // @ts-expect-error La méthode `reinitialise` devrait prendre des paramètres optionnels
        .reinitialise({ serviceARenvoyer: serviceAvecDossier });
      testeur.depotDonnees().enregistreDossier = async () => {};
      testeur.referentiel().recharge({ echeancesRenouvellement: { unAn: {} } });
    });

    it('recherche le service correspondant', async () => {
      await testeur
        .middleware()
        .verifieRechercheService(
          [{ niveau: ECRITURE, rubrique: HOMOLOGUER }],
          testeur.app(),
          {
            url: '/api/service/456/homologation/decision',
            method: 'put',
          }
        );
    });

    it('recherche le dossier courant correspondant', async () => {
      await testeur.middleware().verifieRechercheDossierCourant(testeur.app(), {
        url: '/api/service/456/homologation/decision',
        method: 'put',
      });
    });

    it('aseptise les paramètres reçus', async () => {
      await testeur
        .middleware()
        .verifieAseptisationParametres(
          ['dateHomologation', 'dureeValidite'],
          testeur.app(),
          {
            url: '/api/service/456/homologation/decision',
            method: 'put',
          }
        );
    });

    it("renvoie une erreur 422 si la date d'homologation est invalide", async () => {
      const reponse = await testeur.put(
        '/api/service/456/homologation/decision',
        {
          dateHomologation: 'dateInvalide',
          dureeValidite: 'unAn',
        }
      );
      expect(reponse.status).toBe(422);
      expect(reponse.text).toBe("Date d'homologation invalide");
    });

    it('renvoie une erreur 422 si la durée de validité est inconnue du référentiel', async () => {
      const reponse = await testeur.put(
        '/api/service/456/homologation/decision',
        {
          dateHomologation: new Date(),
          dureeValidite: 'dureeInconnue',
        }
      );
      expect(reponse.status).toBe(422);
      expect(reponse.text).toBe('Durée de validité invalide');
    });

    it("utilise le dépôt pour enregistrer la décision d'homologation", async () => {
      let depotAppele = false;

      testeur.depotDonnees().enregistreDossier = (
        idHomologation: UUID,
        dossier: Dossier
      ) => {
        depotAppele = true;
        expect(idHomologation).toEqual('456');
        expect(dossier.decision.dateHomologation).toEqual('2023-01-01');
        expect(dossier.decision.dureeValidite).toEqual('unAn');
        return Promise.resolve();
      };

      await testeur.put('/api/service/456/homologation/decision', {
        dateHomologation: '2023-01-01',
        dureeValidite: 'unAn',
      });
      expect(depotAppele).toBe(true);
    });
  });

  describe('quand requête PUT sur `/api/service/:id/homologation/telechargement', () => {
    beforeEach(() => {
      const serviceAvecDossier = new Service({
        id: '456',
        descriptionService: { nomService: 'un service' },
        dossiers: [{ id: '999' }],
      });
      testeur
        .middleware()
        // @ts-expect-error La méthode `reinitialise` devrait prendre des paramètres optionnels
        .reinitialise({ serviceARenvoyer: serviceAvecDossier });
      testeur.depotDonnees().enregistreDossier = () => Promise.resolve();
      testeur
        .referentiel()
        .recharge({ documentsHomologation: { decision: {} } });
    });

    it('recherche le service correspondant', async () => {
      await testeur
        .middleware()
        .verifieRechercheService(
          [{ niveau: ECRITURE, rubrique: HOMOLOGUER }],
          testeur.app(),
          {
            url: '/api/service/456/homologation/telechargement',
            method: 'put',
          }
        );
    });

    it('recherche le dossier courant correspondant', async () => {
      await testeur.middleware().verifieRechercheDossierCourant(testeur.app(), {
        url: '/api/service/456/homologation/telechargement',
        method: 'put',
      });
    });

    it('utilise le dépôt pour enregistrer la date du téléchargement', async () => {
      let depotAppele = false;
      const maintenant = new Date('2023-02-21');

      testeur.adaptateurHorloge().maintenant = () => maintenant;

      testeur.depotDonnees().enregistreDossier = async (
        idHomologation: UUID,
        dossier: Dossier
      ) => {
        depotAppele = true;
        expect(idHomologation).toEqual('456');
        expect(dossier.dateTelechargement.date).toEqual(maintenant);
      };

      await testeur.put('/api/service/456/homologation/telechargement');
      expect(depotAppele).toBe(true);
    });
  });

  describe('quand requête PUT sur /api/service/:id/homologation/avis', () => {
    beforeEach(() => {
      const serviceAvecDossier = new Service(
        {
          id: '456',
          descriptionService: { nomService: 'un service' },
          dossiers: [{ id: '999' }],
        },
        testeur.referentiel()
      );
      testeur
        .middleware()
        // @ts-expect-error La méthode `reinitialise` devrait prendre des paramètres optionnels
        .reinitialise({ serviceARenvoyer: serviceAvecDossier });
      testeur.depotDonnees().enregistreDossier = () => Promise.resolve();
      testeur.referentiel().recharge({
        echeancesRenouvellement: { unAn: {} },
        statutsAvisDossierHomologation: { favorable: {} },
      });
    });

    it('recherche le service correspondant', async () => {
      await testeur
        .middleware()
        .verifieRechercheService(
          [{ niveau: ECRITURE, rubrique: HOMOLOGUER }],
          testeur.app(),
          {
            url: '/api/service/456/homologation/avis',
            method: 'put',
          }
        );
    });

    it('recherche le dossier courant correspondant', async () => {
      await testeur.middleware().verifieRechercheDossierCourant(testeur.app(), {
        url: '/api/service/456/homologation/avis',
        method: 'put',
      });
    });

    it('aseptise la liste des avis', async () => {
      await testeur.put('/api/service/456/homologation/avis', {
        avis: [],
      });
      testeur
        .middleware()
        .verifieAseptisationListe('avis', [
          'statut',
          'dureeValidite',
          'commentaires',
        ]);
    });

    it('aseptise les collaborateurs mentionnés dans les avis et le paramètres "avecAvis"', async () => {
      await testeur
        .middleware()
        .verifieAseptisationParametres(
          ['avis.*.collaborateurs.*', 'avecAvis'],
          testeur.app(),
          {
            url: '/api/service/456/homologation/avis',
            method: 'put',
          }
        );
    });

    it("renvoie une 400 si aucun avis n'est envoyé", async () => {
      const reponse = await testeur.put(
        '/api/service/456/homologation/avis',
        {}
      );
      expect(reponse.status).toBe(400);
    });

    describe('utilise le dépôt pour enregistrer les avis', () => {
      it('quand il y a des avis', async () => {
        let depotAppele = false;
        testeur.depotDonnees().enregistreDossier = (
          idHomologation: UUID,
          dossier: Dossier
        ) => {
          depotAppele = true;
          expect(idHomologation).toEqual('456');
          expect(dossier.avis.avis.length).toEqual(1);
          expect(dossier.avis.avecAvis).toBe(true);
          expect(dossier.avis.avis[0].donneesSerialisees()).toEqual({
            collaborateurs: ['Jean Dupond'],
            statut: 'favorable',
            dureeValidite: 'unAn',
            commentaires: 'Ok',
          });
          return Promise.resolve();
        };

        await testeur.put('/api/service/456/homologation/avis', {
          avis: [
            {
              collaborateurs: ['Jean Dupond'],
              statut: 'favorable',
              dureeValidite: 'unAn',
              commentaires: 'Ok',
            },
          ],
          avecAvis: 'true',
        });
        expect(depotAppele).toBe(true);
      });

      it("quand il n'y a pas d'avis", async () => {
        let depotAppele = false;
        testeur.depotDonnees().enregistreDossier = (
          idHomologation: UUID,
          dossier: Dossier
        ) => {
          depotAppele = true;
          expect(idHomologation).toEqual('456');
          expect(dossier.avis.avis.length).toEqual(0);
          expect(dossier.avis.avecAvis).toBe(false);
          return Promise.resolve();
        };

        await testeur.put('/api/service/456/homologation/avis', {
          avis: [],
          avecAvis: 'false',
        });
        expect(depotAppele).toBe(true);
      });
    });
  });

  describe('quand requête PUT sur /api/service/:id/homologation/documents', () => {
    beforeEach(() => {
      const serviceAvecDossier = new Service(
        {
          id: '456',
          descriptionService: { nomService: 'un service' },
          dossiers: [{ id: '999' }],
        },
        testeur.referentiel()
      );
      testeur
        .middleware()
        // @ts-expect-error La méthode `reinitialise` devrait prendre des paramètres optionnels
        .reinitialise({ serviceARenvoyer: serviceAvecDossier });
      testeur.depotDonnees().enregistreDossier = () => Promise.resolve();
    });

    it('recherche le service correspondant', async () => {
      await testeur
        .middleware()
        .verifieRechercheService(
          [{ niveau: ECRITURE, rubrique: HOMOLOGUER }],
          testeur.app(),
          {
            url: '/api/service/456/homologation/documents',
            method: 'put',
          }
        );
    });

    it('recherche le dossier courant correspondant', async () => {
      await testeur.middleware().verifieRechercheDossierCourant(testeur.app(), {
        url: '/api/service/456/homologation/documents',
        method: 'put',
      });
    });

    it('aseptise la liste des documents et le paramètres "avecDocuments"', async () => {
      await testeur
        .middleware()
        .verifieAseptisationParametres(
          ['documents.*', 'avecDocuments'],
          testeur.app(),
          {
            url: '/api/service/456/homologation/documents',
            method: 'put',
          }
        );
    });

    it("renvoie une 400 si aucun document n'est envoyé", async () => {
      const reponse = await testeur.put(
        '/api/service/456/homologation/documents',
        {}
      );
      expect(reponse.status).toBe(400);
    });

    describe('utilise le dépôt pour enregistrer les documents', () => {
      it('quand il y a des documents', async () => {
        let depotAppele = false;
        testeur.depotDonnees().enregistreDossier = (
          idHomologation: UUID,
          dossier: Dossier
        ) => {
          depotAppele = true;
          expect(idHomologation).toEqual('456');
          expect(dossier.documents.documents.length).toEqual(1);
          expect(dossier.documents.avecDocuments).toBe(true);
          expect(dossier.documents.documents[0]).toEqual('unDocument');
          return Promise.resolve();
        };

        await testeur.put('/api/service/456/homologation/documents', {
          documents: ['unDocument'],
          avecDocuments: 'true',
        });
        expect(depotAppele).toBe(true);
      });

      it("quand il n'y a pas de document", async () => {
        let depotAppele = false;
        testeur.depotDonnees().enregistreDossier = (
          idHomologation: UUID,
          dossier: Dossier
        ) => {
          depotAppele = true;
          expect(idHomologation).toEqual('456');
          expect(dossier.documents.documents.length).toEqual(0);
          expect(dossier.documents.avecDocuments).toBe(false);
          return Promise.resolve();
        };

        await testeur.put('/api/service/456/homologation/documents', {
          documents: [],
          avecDocuments: 'false',
        });
        expect(depotAppele).toBe(true);
      });
    });
  });

  describe('quand requête POST sur /api/service/:id/homologation/finalise', () => {
    beforeEach(() => {
      testeur.referentiel().recharge({
        echeancesRenouvellement: { unAn: {} },
        statutsAvisDossierHomologation: { favorable: {} },
      });
      const serviceAvecDossier = new Service(
        {
          id: '456',
          descriptionService: { nomService: 'un service' },
          dossiers: [unDossier().quiEstComplet().quiEstNonFinalise().donnees],
        },
        testeur.referentiel()
      );
      testeur
        .middleware()
        // @ts-expect-error La méthode `reinitialise` devrait prendre des paramètres optionnels
        .reinitialise({ serviceARenvoyer: serviceAvecDossier });
      testeur.depotDonnees().finaliseDossierCourant = () => Promise.resolve();
    });

    it('recherche le service correspondant', async () => {
      await testeur
        .middleware()
        .verifieRechercheService(
          [{ niveau: ECRITURE, rubrique: HOMOLOGUER }],
          testeur.app(),
          {
            url: '/api/service/456/homologation/finalise',
            method: 'post',
          }
        );
    });

    it("utilise le dépôt pour finaliser l'homologation", async () => {
      let servicePasse: Service;
      testeur.depotDonnees().finaliseDossierCourant = async (
        service: Service
      ) => {
        servicePasse = service;
      };

      await testeur.post('/api/service/456/homologation/finalise');

      expect(servicePasse!.id).toEqual('456');
    });
  });

  describe('quand requête DELETE sur `/api/service/:id/homologation/dossierCourant`', () => {
    beforeEach(() => {
      // @ts-expect-error La méthode `reinitialise` devrait prendre des paramètres optionnels
      testeur.middleware().reinitialise({
        autorisationACharger: Autorisation.NouvelleAutorisationProprietaire({
          id: unUUIDRandom(),
          idUtilisateur: unUUIDRandom(),
          idService: unUUIDRandom(),
        }),
      });
    });

    it('utilise le middleware de recherche du service', async () => {
      await testeur
        .middleware()
        .verifieRechercheService(
          [{ niveau: ECRITURE, rubrique: HOMOLOGUER }],
          testeur.app(),
          {
            method: 'delete',
            url: '/api/service/123/homologation/dossierCourant',
          }
        );
    });

    it("retourne une erreur HTTP 422 si le service n'a pas de dossier courant", async () => {
      const service = unService().construis();
      // @ts-expect-error La méthode `reinitialise` devrait prendre des paramètres optionnels
      testeur.middleware().reinitialise({ serviceARenvoyer: service });

      await testeur.verifieRequeteGenereErreurHTTP(
        422,
        'Les dossiers ne comportent pas de dossier courant',
        {
          method: 'delete',
          url: '/api/service/123/homologation/dossierCourant',
        }
      );
    });

    it('demande au dépôt de mettre à jour le service', async () => {
      const referentiel = Referentiel.creeReferentiel({
        // @ts-expect-error On construit un objet partiel
        echeancesRenouvellement: { unAn: {} },
        // @ts-expect-error On construit un objet partiel
        statutsAvisDossierHomologation: { favorable: {} },
      });
      const service = unService(referentiel)
        .avecId('123')
        .avecDossiers([
          unDossier(referentiel).quiEstComplet().quiEstNonFinalise().donnees,
        ])
        .construis();
      let serviceMisAJour: Service;

      // @ts-expect-error La méthode `reinitialise` devrait prendre des paramètres optionnels
      testeur.middleware().reinitialise({ serviceARenvoyer: service });
      testeur.depotDonnees().metsAJourService = async (s: Service) => {
        serviceMisAJour = s;
      };

      await testeur.delete('/api/service/123/homologation/dossierCourant');

      expect(serviceMisAJour!.id).toBe('123');
    });
  });
});
