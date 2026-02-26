import expect from 'expect.js';
import testeurMSS from '../testeurMSS.js';
import { unDossier } from '../../constructeurs/constructeurDossier.js';
import {
  unService,
  unServiceV2,
} from '../../constructeurs/constructeurService.js';
import { ErreurDonneesObligatoiresManquantes } from '../../../src/erreurs.js';
import {
  Permissions,
  Rubriques,
  tousDroitsEnEcriture,
} from '../../../src/modeles/autorisations/gestionDroits.js';
import { uneAutorisation } from '../../constructeurs/constructeurAutorisation.js';
import { Autorisation } from '../../../src/modeles/autorisations/autorisation.js';
import { unUtilisateur } from '../../constructeurs/constructeurUtilisateur.js';
import { unUUIDRandom } from '../../constructeurs/UUID.js';

const { ECRITURE, LECTURE } = Permissions;
const { RISQUES, DECRIRE, SECURISER, HOMOLOGUER } = Rubriques;

describe('Le serveur MSS des routes /api/service/*', () => {
  const testeur = testeurMSS();

  beforeEach(() => testeur.initialise());

  describe('quand requête PUT sur `/api/service/:id/risques/:idRisque`', () => {
    beforeEach(() => {
      testeur.depotDonnees().ajouteRisqueGeneralAService = async () => {};
    });

    it('recherche le service correspondant', async () => {
      await testeur
        .middleware()
        .verifieRechercheService(
          [{ niveau: ECRITURE, rubrique: RISQUES }],
          testeur.app(),
          {
            method: 'put',
            url: '/api/service/456/risques/unRisqueExistant',
          }
        );
    });

    describe('retourne une erreur 400 si', () => {
      it("l'id du risque est invalide", async () => {
        const { status } = await testeur.put(
          '/api/service/456/risques/unIdRisqueInexistant'
        );

        expect(status).to.be(400);
      });

      it('le niveau de gravité est invalide', async () => {
        const { status } = await testeur.put(
          '/api/service/456/risques/indisponibiliteService',
          { niveauGravite: 'pasUnNiveau', niveauVraisemblance: '' }
        );

        expect(status).to.be(400);
      });

      it('le niveau de vraisemblance est invalide', async () => {
        const { status } = await testeur.put(
          '/api/service/456/risques/indisponibiliteService',
          { niveauGravite: '', niveauVraisemblance: 'pasUnNiveau' }
        );

        expect(status).to.be(400);
      });

      it('le commentaire est invalide', async () => {
        const { status } = await testeur.put(
          '/api/service/456/risques/indisponibiliteService',
          { niveauGravite: '', niveauVraisemblance: '', commentaire: 123 }
        );

        expect(status).to.be(400);
      });

      it('la désactivation est invalide', async () => {
        const { status } = await testeur.put(
          '/api/service/456/risques/indisponibiliteService',
          { niveauGravite: '', niveauVraisemblance: '', desactive: 123 }
        );

        expect(status).to.be(400);
      });
    });

    it('accepte des niveaux vides (pour les remettre à zéro)', async () => {
      const { status } = await testeur.put(
        '/api/service/456/risques/indisponibiliteService',
        { niveauGravite: '', niveauVraisemblance: '' }
      );

      expect(status).to.be(200);
    });

    it('délègue au dépôt de donnée la mise à jour du risque', async () => {
      let idServiceRecu;
      let donneesRecues;
      testeur.depotDonnees().ajouteRisqueGeneralAService = async (
        service,
        donnees
      ) => {
        idServiceRecu = service.id;
        donneesRecues = donnees;
      };

      await testeur.put('/api/service/456/risques/indisponibiliteService', {
        niveauGravite: 'nonConcerne',
        niveauVraisemblance: 'peuVraisemblable',
        commentaire: "c'est important",
        desactive: true,
      });

      expect(idServiceRecu).to.be('456');
      expect(donneesRecues.niveauGravite).to.eql('nonConcerne');
      expect(donneesRecues.niveauVraisemblance).to.eql('peuVraisemblable');
      expect(donneesRecues.commentaire).to.eql("c'est important");
      expect(donneesRecues.desactive).to.eql(true);
      expect(donneesRecues.id).to.eql('indisponibiliteService');
    });

    it('retourne la représentation du risque modifié', async () => {
      testeur.depotDonnees().ajouteRisqueGeneralAService = async () => {};

      const reponse = await testeur.put(
        '/api/service/456/risques/indisponibiliteService',
        {
          niveauGravite: 'nonConcerne',
          niveauVraisemblance: 'peuVraisemblable',
          commentaire: "c'est important",
        }
      );

      expect(reponse.body.niveauVraisemblance).to.be('peuVraisemblable');
    });
  });

  describe('quand requête DELETE sur `/api/service/:id`', () => {
    beforeEach(() => {
      testeur.middleware().reinitialise({
        autorisationACharger: Autorisation.NouvelleAutorisationProprietaire(),
      });
      testeur.depotDonnees().supprimeService = () => Promise.resolve();
    });

    it('utilise le middleware de recherche du service', async () => {
      await testeur.middleware().verifieRechercheService([], testeur.app(), {
        method: 'delete',
        url: '/api/service/123',
      });
    });

    it("utilise le middleware de chargement de l'autorisation", async () => {
      await testeur
        .middleware()
        .verifieChargementDesAutorisations(testeur.app(), {
          method: 'delete',
          url: '/api/service/456',
        });
    });

    it("retourne une erreur HTTP 403 si l'utilisateur courant n'a pas accès au service", async () => {
      const autorisationNonTrouvee = undefined;
      testeur
        .middleware()
        .reinitialise({ autorisationACharger: autorisationNonTrouvee });

      await testeur.verifieRequeteGenereErreurHTTP(
        403,
        'Droits insuffisants pour supprimer le service',
        { method: 'delete', url: '/api/service/123' }
      );
    });

    it("retourne une erreur HTTP 403 si l'utilisateur courant n'a pas les droits de suppression du service", async () => {
      testeur.middleware().reinitialise({
        autorisationACharger: uneAutorisation().deContributeur().construis(),
      });

      await testeur.verifieRequeteGenereErreurHTTP(
        403,
        'Droits insuffisants pour supprimer le service',
        { method: 'delete', url: '/api/service/123' }
      );
    });

    it('demande au dépôt de supprimer le service', async () => {
      let serviceSupprime = false;

      testeur.depotDonnees().supprimeService = (idService) => {
        try {
          expect(idService).to.equal('123');
          serviceSupprime = true;

          return Promise.resolve();
        } catch (e) {
          return Promise.reject(e);
        }
      };

      const reponse = await testeur.delete('/api/service/123');
      expect(serviceSupprime).to.be(true);
      expect(reponse.status).to.equal(200);
      expect(reponse.text).to.equal('Service supprimé');
    });
  });

  describe('quand requête COPY sur `/api/service/:id`', () => {
    beforeEach(() => {
      testeur.depotDonnees().dupliqueService = () => Promise.resolve();
      testeur.middleware().reinitialise({
        autorisationACharger: Autorisation.NouvelleAutorisationProprietaire(),
      });
    });

    it('applique une protection de trafic', async () => {
      await testeur.middleware().verifieProtectionTrafic(testeur.app(), {
        method: 'copy',
        url: '/api/service/123',
      });
    });

    it('utilise le middleware de chargement du service', async () => {
      await testeur.middleware().verifieRechercheService([], testeur.app(), {
        method: 'copy',
        url: '/api/service/123',
      });
    });

    it("utilise le middleware de chargement de l'autorisation", async () => {
      await testeur
        .middleware()
        .verifieChargementDesAutorisations(testeur.app(), {
          method: 'copy',
          url: '/api/service/123',
        });
    });

    it("retourne une erreur HTTP 403 si l'utilisateur courant n'a pas accès au service", async () => {
      const autorisationNonTrouvee = undefined;
      testeur
        .middleware()
        .reinitialise({ autorisationACharger: autorisationNonTrouvee });

      await testeur.verifieRequeteGenereErreurHTTP(
        403,
        'Droits insuffisants pour dupliquer le service',
        { method: 'copy', url: '/api/service/123' }
      );
    });

    it("retourne une erreur HTTP 403 si l'utilisateur courant n'est pas le créateur du service", async () => {
      testeur.middleware().reinitialise({
        autorisationACharger: uneAutorisation().deContributeur().construis(),
      });

      await testeur.verifieRequeteGenereErreurHTTP(
        403,
        'Droits insuffisants pour dupliquer le service',
        { method: 'copy', url: '/api/service/123' }
      );
    });

    it('retourne une erreur HTTP 424 si des données obligatoires ne sont pas renseignées', async () => {
      testeur.depotDonnees().dupliqueService = async () => {
        throw new ErreurDonneesObligatoiresManquantes(
          'Certaines données obligatoires ne sont pas renseignées'
        );
      };

      await testeur.verifieRequeteGenereErreurHTTP(
        424,
        {
          type: 'DONNEES_OBLIGATOIRES_MANQUANTES',
          message:
            'La duplication a échoué car certaines données obligatoires ne sont pas renseignées',
        },
        { method: 'copy', url: '/api/service/123' }
      );
    });

    it('demande au dépôt de dupliquer le service', async () => {
      let serviceDuplique = false;

      testeur.middleware().reinitialise({
        idUtilisateur: '999',
        autorisationACharger: Autorisation.NouvelleAutorisationProprietaire(),
      });

      testeur.depotDonnees().dupliqueService = (idService, idUtilisateur) => {
        try {
          expect(idService).to.equal('123');
          expect(idUtilisateur).to.equal('999');
          serviceDuplique = true;

          return Promise.resolve();
        } catch (e) {
          return Promise.reject(e);
        }
      };

      const reponse = await testeur.copy('/api/service/123');
      expect(serviceDuplique).to.be(true);
      expect(reponse.status).to.equal(200);
      expect(reponse.text).to.equal('Service dupliqué');
    });
  });

  describe('quand requête GET sur `/api/service/:id', () => {
    beforeEach(() => {
      testeur.referentiel().recharge({
        echeancesRenouvellement: { unAn: {} },
        etapesParcoursHomologation: [{ numero: 1, id: 'autorite' }],
        statutsAvisDossierHomologation: { favorable: {} },
        statutsHomologation: { nonRealisee: {} },
        categoriesMesures: { gouvernance: {} },
        statutsMesures: { fait: {} },
      });

      const donneesDossier = unDossier(testeur.referentiel())
        .quiEstComplet()
        .quiEstNonFinalise().donnees;
      const serviceARenvoyer = unService(testeur.referentiel())
        .avecId('456')
        .ajouteUnContributeur(
          unUtilisateur().avecId('AAA').avecEmail('aaa@mail.fr').donnees
        )
        .ajouteUnContributeur(
          unUtilisateur().avecId('BBB').avecEmail('bbb@mail.fr').donnees
        )
        .avecDossiers([donneesDossier])
        .construis();
      testeur.middleware().reinitialise({
        serviceARenvoyer,
        idUtilisateur: '123',
        autorisationACharger: uneAutorisation()
          .avecDroits({
            [HOMOLOGUER]: LECTURE,
            [SECURISER]: LECTURE,
            [DECRIRE]: LECTURE,
          })
          .construis(),
      });
    });

    it('recherche le service correspondant', async () => {
      await testeur.middleware().verifieRechercheService([], testeur.app(), {
        method: 'get',
        url: '/api/service/456',
      });
    });

    it("utilise le middleware de chargement de l'autorisation", async () => {
      await testeur
        .middleware()
        .verifieChargementDesAutorisations(testeur.app(), '/api/service/456');
    });

    it('retourne la représentation du service grâce à `objetGetService`', async () => {
      const reponse = await testeur.get('/api/service/456');

      expect(reponse.body).to.eql({
        id: '456',
        nomService: 'Nom service',
        organisationResponsable: 'ANSSI',
        contributeurs: [
          {
            id: 'AAA',
            prenomNom: 'aaa@mail.fr',
            initiales: '',
            poste: '',
            estUtilisateurCourant: false,
          },
          {
            id: 'BBB',
            prenomNom: 'bbb@mail.fr',
            initiales: '',
            poste: '',
            estUtilisateurCourant: false,
          },
        ],
        statutHomologation: {
          id: 'nonRealisee',
          enCoursEdition: true,
          etapeCourante: 'autorite',
        },
        nombreContributeurs: 2,
        estProprietaire: false,
        documentsPdfDisponibles: ['syntheseSecurite'],
        permissions: { gestionContributeurs: false },
        aUneSuggestionAction: false,
        actionRecommandee: { autorisee: false, id: 'simulerReferentielV2' },
        niveauSecurite: 'niveau1',
        pourcentageCompletude: 0,
      });
    });
  });

  describe('quand requête PATCH sur `/api/service/:id/autorisations/:idAutorisation`', () => {
    beforeEach(() => {
      testeur.middleware().reinitialise({
        autorisationACharger: uneAutorisation()
          .deProprietaire('AAA', '456')
          .construis(),
      });

      testeur.depotDonnees().autorisation = async () =>
        uneAutorisation().avecTousDroitsEcriture().construis();

      testeur.depotDonnees().sauvegardeAutorisation = async () => {};
    });

    it('recherche le service correspondant', async () => {
      await testeur.middleware().verifieRechercheService([], testeur.app(), {
        method: 'PATCH',
        url: '/api/service/456/autorisations/uuid-1',
        data: { droits: tousDroitsEnEcriture() },
      });
    });

    it("jette une erreur si l'id d'autorisation est invalide", async () => {
      const { status } = await testeur.patch(
        '/api/service/456/autorisations/pasUnUUID',
        { droits: tousDroitsEnEcriture() }
      );

      expect(status).to.be(400);
    });

    it('jette une erreur si les droits sont invalides', async () => {
      const { status } = await testeur.patch(
        `/api/service/456/autorisations/${unUUIDRandom()}`,
        { droits: 'pasDesDroits' }
      );

      expect(status).to.be(400);
    });

    it("utilise le middleware de chargement de l'autorisation", async () => {
      await testeur
        .middleware()
        .verifieChargementDesAutorisations(testeur.app(), {
          method: 'PATCH',
          url: '/api/service/456/autorisations/uuid-1',
          data: { droits: tousDroitsEnEcriture() },
        });
    });

    it("renvoie une erreur 422 si l'utilisateur courant tente de modifier ses propres droits", async () => {
      const monAutorisation = uneAutorisation()
        .deProprietaire('123', 'ABC')
        .construis();

      testeur.middleware().reinitialise({
        idUtilisateur: '123',
        autorisationACharger: monAutorisation,
      });
      testeur.depotDonnees().autorisation = async () => monAutorisation;

      const reponse = await testeur.patch(
        `/api/service/456/autorisations/${unUUIDRandom()}`,
        { droits: tousDroitsEnEcriture() }
      );

      expect(reponse.status).to.equal(422);
      expect(reponse.body).to.eql({ code: 'AUTO-MODIFICATION_INTERDITE' });
    });

    it("renvoie une erreur 422 si l'utilisateur tente de modifier une autorisation qui n'appartient pas au service ciblé", async () => {
      const serviceABC = unService().avecId('ABC').construis();
      const leroyProprietaireDeABC = uneAutorisation()
        .deProprietaire('LEROY', 'ABC')
        .construis();

      testeur.middleware().reinitialise({
        idUtilisateur: 'LEROY',
        serviceARenvoyer: serviceABC,
        autorisationACharger: leroyProprietaireDeABC,
      });

      const autorisationSurDEF = uneAutorisation()
        .deContributeur('DUPONT', 'DEF')
        .construis();
      testeur.depotDonnees().autorisation = async () => autorisationSurDEF;

      const leroyVeutModifierDEF = `/api/service/456/autorisations/${unUUIDRandom()}`;
      const reponse = await testeur.patch(leroyVeutModifierDEF, {
        droits: tousDroitsEnEcriture(),
      });

      expect(reponse.status).to.equal(422);
      expect(reponse.body).to.eql({ code: 'LIEN_INCOHERENT' });
    });

    it("renvoie une erreur 403 si l'utilisateur courant n'a pas le droit de gérer les contributeurs sur le service", async () => {
      testeur.middleware().reinitialise({
        autorisationACharger: { peutGererContributeurs: () => false },
      });

      const reponse = await testeur.patch(
        `/api/service/456/autorisations/${unUUIDRandom()}`,
        { droits: tousDroitsEnEcriture() }
      );

      expect(reponse.status).to.equal(403);
      expect(reponse.body).to.eql({ code: 'INTERDIT' });
    });

    it("récupère l'autorisation cible et lui applique les droits demandés puis persiste la modification", async () => {
      let autorisationCiblee;
      testeur.depotDonnees().autorisation = async (id) => {
        autorisationCiblee = id;
        return uneAutorisation().deContributeur('DUPONT', '456').construis();
      };

      let autorisationPersistee;
      testeur.depotDonnees().sauvegardeAutorisation = async (autorisation) => {
        autorisationPersistee = autorisation;
      };

      const droitsCible = {
        DECRIRE: 1,
        SECURISER: 1,
        HOMOLOGUER: 0,
        RISQUES: 0,
        CONTACTS: 2,
      };
      const idAutorisation = unUUIDRandom();
      await testeur.patch(`/api/service/456/autorisations/${idAutorisation}`, {
        droits: droitsCible,
      });

      expect(autorisationCiblee).to.be(idAutorisation);
      expect(autorisationPersistee.droits).to.eql(droitsCible);
    });

    describe("concernant la dissociation des modèles de l'utilisateur concerné", () => {
      beforeEach(() => {
        const service = unService().avecId('S1').construis();
        const proprietaire = uneAutorisation()
          .deProprietaire('P1', 'S1')
          .construis();
        testeur.middleware().reinitialise({
          idUtilisateur: 'P1',
          serviceARenvoyer: service,
          autorisationACharger: proprietaire,
        });
      });
      it("délègue au dépôt de données la dissociation si l'utilisateur perds les droits d'écriture sur sécuriser", async () => {
        testeur.depotDonnees().autorisation = async () =>
          uneAutorisation().avecId('A1').deProprietaire('U1', 'S1').construis();
        let donneesRecues;
        testeur.depotDonnees().dissocieTousModelesMesureSpecifiqueDeUtilisateurSurService =
          async (idUtilisateur, idService) => {
            donneesRecues = { idUtilisateur, idService };
          };
        const droitsCible = {
          DECRIRE: 1,
          SECURISER: 1,
          HOMOLOGUER: 0,
          RISQUES: 0,
          CONTACTS: 2,
        };
        await testeur.patch(`/api/service/S1/autorisations/${unUUIDRandom()}`, {
          droits: droitsCible,
        });

        expect(donneesRecues).to.eql({ idUtilisateur: 'U1', idService: 'S1' });
      });

      it("ne fait rien si l'utilisateur n'avait pas les droits d'écriture sur sécuriser", async () => {
        testeur.depotDonnees().autorisation = async () =>
          uneAutorisation()
            .avecId('A1')
            .deContributeur('U1', 'S1')
            .avecDroits({})
            .construis();
        let depotAppele = false;
        testeur.depotDonnees().dissocieTousModelesMesureSpecifiqueDeUtilisateurSurService =
          async () => {
            depotAppele = true;
          };
        const droitsCible = {
          DECRIRE: 1,
          SECURISER: 2,
          HOMOLOGUER: 0,
          RISQUES: 0,
          CONTACTS: 2,
        };
        await testeur.patch('/api/service/S1/autorisations/A1', {
          droits: droitsCible,
        });

        expect(depotAppele).to.be(false);
      });

      it("ne fait rien si l'utilisateur avait les droits d'écriture sur sécuriser et ne les perds pas", async () => {
        testeur.depotDonnees().autorisation = async () =>
          uneAutorisation()
            .avecId('A1')
            .deContributeur('U1', 'S1')
            .avecDroits({ SECURISER: 2 })
            .construis();
        let depotAppele = false;
        testeur.depotDonnees().dissocieTousModelesMesureSpecifiqueDeUtilisateurSurService =
          async () => {
            depotAppele = true;
          };
        const droitsCible = {
          DECRIRE: 1,
          SECURISER: 2,
          HOMOLOGUER: 0,
          RISQUES: 0,
          CONTACTS: 2,
        };
        await testeur.patch('/api/service/S1/autorisations/A1', {
          droits: droitsCible,
        });

        expect(depotAppele).to.be(false);
      });
    });

    it("renvoie la représentation API de l'autorisation mise à jour", async () => {
      testeur.depotDonnees().autorisation = async (id) =>
        uneAutorisation().avecId(id).deContributeur('888', '456').construis();

      const droitsCible = {
        DECRIRE: 1,
        SECURISER: 1,
        HOMOLOGUER: 0,
        RISQUES: 0,
        CONTACTS: 2,
      };

      const idAutorisation = unUUIDRandom();
      const reponse = await testeur.patch(
        `/api/service/456/autorisations/${idAutorisation}`,
        { droits: droitsCible }
      );

      expect(reponse.body).to.eql({
        idAutorisation,
        idUtilisateur: '888',
        resumeNiveauDroit: 'PERSONNALISE',
        droits: droitsCible,
      });
    });

    it('ne renvoie pas d’erreur 422 si propriétaire est false', async () => {
      testeur.depotDonnees().autorisation = async (id) =>
        uneAutorisation().avecId(id).deContributeur('888', '456').construis();

      const reponse = await testeur.patch(
        `/api/service/456/autorisations/${unUUIDRandom()}`,
        { droits: { ...tousDroitsEnEcriture(), estProprietaire: false } }
      );

      expect(reponse.status).to.be(200);
    });

    it('permet de nommer un nouveau propriétaire', async () => {
      testeur.depotDonnees().autorisation = async () =>
        uneAutorisation().deContributeur('BBB', '456').construis();

      let autorisationPersistee;
      testeur.depotDonnees().sauvegardeAutorisation = async (autorisation) => {
        autorisationPersistee = autorisation;
      };

      await testeur.patch(`/api/service/456/autorisations/${unUUIDRandom()}`, {
        droits: { ...tousDroitsEnEcriture(), estProprietaire: true },
      });

      expect(autorisationPersistee.estProprietaire).to.be(true);
    });
  });

  describe('quand requête GET sur `/api/service/:id/autorisations', () => {
    beforeEach(() => {
      const serviceARenvoyer = unService(testeur.referentiel())
        .avecId('456')
        .construis();
      testeur.middleware().reinitialise({
        serviceARenvoyer,
        idUtilisateur: 'AAA',
      });
      testeur.depotDonnees().autorisationsDuService = async (idService) => [
        uneAutorisation().deProprietaire('AAA', idService).construis(),
      ];
    });

    it('recherche le service correspondant', async () => {
      await testeur.middleware().verifieRechercheService([], testeur.app(), {
        method: 'get',
        url: '/api/service/456/autorisations',
      });
    });

    it('utilise le depot pour récupérer toutes les autorisations du service', async () => {
      let donneesPassees = {};
      testeur.depotDonnees().autorisationsDuService = async (idService) => {
        donneesPassees = { idService };
        return [uneAutorisation().deProprietaire('AAA', idService).construis()];
      };

      const serviceARenvoyer = unService(testeur.referentiel())
        .avecId('456')
        .avecNContributeurs(1)
        .construis();
      testeur.middleware().reinitialise({
        serviceARenvoyer,
        idUtilisateur: 'AAA',
      });

      await testeur.get('/api/service/456/autorisations');

      expect(donneesPassees).to.eql({ idService: '456' });
    });

    it('retourne les autorisations de chaque utilisateur du service', async () => {
      testeur.depotDonnees().autorisationsDuService = async () => [
        uneAutorisation()
          .avecId('uuid-a')
          .deProprietaire('AAA', '456')
          .construis(),
      ];

      const reponse = await testeur.get('/api/service/456/autorisations');

      expect(reponse.body).to.eql([
        {
          idAutorisation: 'uuid-a',
          idUtilisateur: 'AAA',
          resumeNiveauDroit: 'PROPRIETAIRE',
          droits: tousDroitsEnEcriture(),
        },
      ]);
    });

    it("renvoie toutes les autorisations si l'utilisateur est créateur", async () => {
      const serviceARenvoyer = unService(testeur.referentiel())
        .avecId('456')
        .avecNContributeurs(3, ['ABC', 'DEF', 'GHI'])
        .construis();
      testeur.middleware().reinitialise({
        serviceARenvoyer,
        idUtilisateur: 'AAA',
      });
      testeur.depotDonnees().autorisationsDuService = async () => [
        uneAutorisation().deProprietaire('AAA', '456').construis(),
        uneAutorisation().deContributeur('ABC', '456').construis(),
        uneAutorisation().deContributeur('DEF', '456').construis(),
        uneAutorisation().deContributeur('GHI', '456').construis(),
      ];

      const reponse = await testeur.get('/api/service/456/autorisations');

      expect(reponse.body.length).to.be(3 + 1);
    });

    it("renvoie uniquement le créateur et l'utilisateur s'il n'est pas créateur", async () => {
      const serviceARenvoyer = unService(testeur.referentiel())
        .avecId('456')
        .avecNContributeurs(3, ['ABC', 'DEF', 'GHI'])
        .construis();
      testeur.middleware().reinitialise({
        serviceARenvoyer,
        idUtilisateur: 'DEF',
      });
      testeur.depotDonnees().autorisationsDuService = async () => [
        uneAutorisation().deProprietaire('AAA', '456').construis(),
        uneAutorisation().deContributeur('ABC', '456').construis(),
        uneAutorisation().deContributeur('DEF', '456').construis(),
        uneAutorisation().deContributeur('GHI', '456').construis(),
      ];

      const reponse = await testeur.get('/api/service/456/autorisations');

      expect(reponse.body.length).to.be(2);
      expect(reponse.body[0].idUtilisateur).to.equal('AAA');
      expect(reponse.body[1].idUtilisateur).to.equal('DEF');
    });
  });

  describe('quand requête GET sur `/api/service/:id/indiceCyber', () => {
    it('recherche le service correspondant', async () => {
      await testeur
        .middleware()
        .verifieRechercheService(
          [{ niveau: LECTURE, rubrique: SECURISER }],
          testeur.app(),
          {
            method: 'get',
            url: '/api/service/456/indiceCyber',
          }
        );
    });

    it("renvoie l'indice cyber du service", async () => {
      const serviceARenvoyer = unService().construis();
      serviceARenvoyer.indiceCyber = () => ({ total: 1.5 });
      testeur.middleware().reinitialise({
        serviceARenvoyer,
      });

      const reponse = await testeur.get('/api/service/456/indiceCyber');

      expect(reponse.body.total).to.be(1.5);
    });
  });

  describe('quand requête GET sur `/api/service/:id/indiceCyberPersonnalise', () => {
    it('recherche le service correspondant', async () => {
      await testeur
        .middleware()
        .verifieRechercheService(
          [{ niveau: LECTURE, rubrique: SECURISER }],
          testeur.app(),
          {
            method: 'get',
            url: '/api/service/456/indiceCyberPersonnalise',
          }
        );
    });

    it("renvoie l'indice cyber personnalisé du service", async () => {
      const serviceARenvoyer = unService().construis();
      serviceARenvoyer.indiceCyberPersonnalise = () => ({ total: 2.5 });
      testeur.middleware().reinitialise({
        serviceARenvoyer,
      });

      const reponse = await testeur.get(
        '/api/service/456/indiceCyberPersonnalise'
      );

      expect(reponse.body.total).to.be(2.5);
    });
  });

  describe('quand requête PUT sur `/api/service/:id/suggestionAction/:nature`', () => {
    it('recherche le service correspondant', async () => {
      await testeur.middleware().verifieRechercheService([], testeur.app(), {
        method: 'put',
        url: '/api/service/123/suggestionAction/peuimporte',
      });
    });

    it('utilise le dépôt de données pour acquitter la suggestion', async () => {
      let donneesDepotAppele = null;
      testeur.depotDonnees().acquitteSuggestionAction = (
        idService,
        natureSuggestion
      ) => {
        donneesDepotAppele = { idService, natureSuggestion };
      };

      const resultat = await testeur.put(
        '/api/service/123/suggestionAction/miseAJourSiret'
      );

      expect(donneesDepotAppele).to.be.an('object');
      expect(donneesDepotAppele.idService).to.be('123');
      expect(donneesDepotAppele.natureSuggestion).to.be('miseAJourSiret');
      expect(resultat.status).to.be(200);
    });

    it('renvoie une erreur lorsque la nature n’est pas connue', async () => {
      const reponse = await testeur.put(
        '/api/service/123/suggestionAction/inconnue'
      );

      expect(reponse.status).to.be(400);
    });
  });

  describe('quand requête GET sur `/api/service/:id/risques/v2', () => {
    it('recherche le service correspondant', async () => {
      await testeur
        .middleware()
        .verifieRechercheService(
          [{ niveau: LECTURE, rubrique: RISQUES }],
          testeur.app(),
          {
            method: 'get',
            url: '/api/service/456/risques/v2',
          }
        );
    });

    it("utilise le middleware de chargement de l'autorisation", async () => {
      await testeur
        .middleware()
        .verifieChargementDesAutorisations(
          testeur.app(),
          '/api/service/456/risques/v2'
        );
    });

    it('retourne la représentation des risques V2', async () => {
      testeur
        .middleware()
        .reinitialise({ serviceARenvoyer: unServiceV2().construis() });

      const reponse = await testeur.get('/api/service/456/risques/v2');

      expect(reponse.body.risques).to.be.an(Array);
      expect(reponse.body.risquesCibles).to.be.an(Array);
      expect(reponse.body.risquesBruts).to.be.an(Array);
    });
  });
});
