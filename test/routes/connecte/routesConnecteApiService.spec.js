import expect from 'expect.js';
import testeurMSS from '../testeurMSS.js';
import { unDossier } from '../../constructeurs/constructeurDossier.js';
import { unService } from '../../constructeurs/constructeurService.js';
import {
  ErreurDonneesObligatoiresManquantes,
  ErreurDroitsInsuffisantsPourModelesDeMesureSpecifique,
  ErreurMesureInconnue,
  ErreurModeleDeMesureSpecifiqueDejaAssociee,
  ErreurModeleDeMesureSpecifiqueIntrouvable,
  ErreurNomServiceDejaExistant,
  ErreurRisqueInconnu,
  ErreurSuppressionImpossible,
} from '../../../src/erreurs.js';
import Service from '../../../src/modeles/service.js';
import {
  Permissions,
  Rubriques,
  tousDroitsEnEcriture,
} from '../../../src/modeles/autorisations/gestionDroits.js';
import { uneAutorisation } from '../../constructeurs/constructeurAutorisation.js';
import { Autorisation } from '../../../src/modeles/autorisations/autorisation.js';
import { unUtilisateur } from '../../constructeurs/constructeurUtilisateur.js';
import Mesures from '../../../src/modeles/mesures.js';
import * as Referentiel from '../../../src/referentiel.js';
import Risques from '../../../src/modeles/risques.js';
import { unUUIDRandom } from '../../constructeurs/UUID.js';

const { ECRITURE, LECTURE } = Permissions;
const { RISQUES, DECRIRE, SECURISER, CONTACTS, HOMOLOGUER } = Rubriques;

describe('Le serveur MSS des routes /api/service/*', () => {
  const testeur = testeurMSS();

  beforeEach(() => testeur.initialise());

  describe('quand requête PUT sur `/api/service/:id`', () => {
    beforeEach(() => {
      testeur.depotDonnees().ajouteDescriptionService = async () => {};
    });

    it('recherche le service correspondant', async () => {
      await testeur
        .middleware()
        .verifieRechercheService(
          [{ niveau: ECRITURE, rubrique: DECRIRE }],
          testeur.app(),
          {
            method: 'put',
            url: '/api/service/456',
          }
        );
    });

    it('aseptise les paramètres', async () => {
      await testeur
        .middleware()
        .verifieAseptisationParametres(
          [
            'nomService',
            'organisationsResponsables.*',
            'nombreOrganisationsUtilisatrices.*',
          ],
          testeur.app(),
          { method: 'put', url: '/api/service/456' }
        );
    });

    it("aseptise la liste des points d'accès ainsi que son contenu", async () => {
      await testeur.put('/api/service/456', {});

      testeur
        .middleware()
        .verifieAseptisationListe('pointsAcces', ['description']);
    });

    it('aseptise la liste des fonctionnalités spécifiques ainsi que son contenu', async () => {
      await testeur.put('/api/service/456', {});

      testeur
        .middleware()
        .verifieAseptisationListe('fonctionnalitesSpecifiques', [
          'description',
        ]);
    });

    it('aseptise la liste des données sensibles spécifiques ainsi que son contenu', async () => {
      await testeur.put('/api/service/456', {});

      testeur
        .middleware()
        .verifieAseptisationListe('donneesSensiblesSpecifiques', [
          'description',
        ]);
    });

    it('demande au dépôt de données de mettre à jour le service', async () => {
      testeur.middleware().reinitialise({ idUtilisateur: '123' });

      testeur.depotDonnees().ajouteDescriptionService = async (
        idUtilisateur,
        idService,
        infosGenerales
      ) => {
        expect(idUtilisateur).to.equal('123');
        expect(idService).to.equal('456');
        expect(infosGenerales.nomService).to.equal('Nouveau Nom');
      };

      const reponse = await testeur.put('/api/service/456', {
        nomService: 'Nouveau Nom',
      });

      expect(reponse.status).to.equal(200);
      expect(reponse.body).to.eql({ idService: '456' });
    });

    it('retourne une erreur HTTP 422 si le validateur du modèle échoue', async () => {
      await testeur.verifieRequeteGenereErreurHTTP(
        422,
        'Le statut de déploiement "statutInvalide" est invalide',
        {
          method: 'put',
          url: '/api/service/456',
          data: { statutDeploiement: 'statutInvalide' },
        }
      );
    });

    it('retourne une erreur HTTP 422 si le nom du service existe déjà', async () => {
      testeur.depotDonnees().ajouteDescriptionService = async () => {
        throw new ErreurNomServiceDejaExistant('oups');
      };

      await testeur.verifieRequeteGenereErreurHTTP(
        422,
        { erreur: { code: 'NOM_SERVICE_DEJA_EXISTANT' } },
        {
          method: 'put',
          url: '/api/service/456',
          data: { nomService: 'service déjà existant' },
        }
      );
    });
  });

  describe('quand requête GET sur `/api/service/:id/mesures', () => {
    it('recherche le service correspondant', async () => {
      await testeur
        .middleware()
        .verifieRechercheService(
          [{ niveau: LECTURE, rubrique: SECURISER }],
          testeur.app(),
          {
            method: 'get',
            url: '/api/service/456/mesures',
          }
        );
    });

    it('retourne la représentation enrichie des mesures', async () => {
      const avecMesureA = Referentiel.creeReferentiel({
        mesures: { mesureA: {} },
      });
      const mesures = new Mesures(
        {
          mesuresGenerales: [
            { id: 'mesureA', statut: 'fait', modalites: 'un commentaire' },
          ],
        },
        avecMesureA,
        { mesureA: { description: 'Mesure A', referentiel: 'ANSSI' } }
      );

      testeur.middleware().reinitialise({
        serviceARenvoyer: unService(avecMesureA)
          .avecMesures(mesures)
          .construis(),
      });

      const reponse = await testeur.get('/api/service/456/mesures');

      expect(reponse.body).to.eql({
        mesuresGenerales: {
          mesureA: {
            description: 'Mesure A',
            statut: 'fait',
            modalites: 'un commentaire',
            referentiel: 'ANSSI',
            responsables: [],
          },
        },
        mesuresSpecifiques: [],
      });
    });
  });

  describe('quand requête POST sur `api/service/:id/mesuresSpecifiques`', () => {
    const unePayloadValideSauf = (cleValeur) => ({
      description: 'une description',
      descriptionLongue: 'des détails',
      categorie: 'gouvernance',
      statut: 'fait',
      priorite: '',
      modalites: '',
      echeance: '01/23/2025',
      ...cleValeur,
    });

    beforeEach(() => {
      testeur.depotDonnees().ajouteMesureSpecifiqueAuService = async () => {};
      testeur.referentiel().enrichis({
        categoriesMesures: { gouvernance: '' },
      });
    });

    it('retourne une réponse 201', async () => {
      const reponse = await testeur.post(
        '/api/service/456/mesuresSpecifiques',
        unePayloadValideSauf()
      );

      expect(reponse.status).to.be(201);
    });

    it("vérifie que l'utilisateur est authentifié", async () => {
      await testeur
        .middleware()
        .verifieRequeteExigeAcceptationCGU(testeur.app(), {
          method: 'post',
          url: '/api/service/456/mesuresSpecifiques',
          data: [],
        });
    });

    it('recherche le service correspondant', async () => {
      await testeur
        .middleware()
        .verifieRechercheService(
          [{ niveau: ECRITURE, rubrique: SECURISER }],
          testeur.app(),
          {
            method: 'post',
            url: '/api/service/456/mesuresSpecifiques',
            data: [],
          }
        );
    });

    it("délègue au dépôt de données l'ajout de la mesure spécifique", async () => {
      const serviceARenvoyer = unService(testeur.referentiel())
        .avecId('456')
        .construis();
      testeur.middleware().reinitialise({
        idUtilisateur: '999',
        serviceARenvoyer,
      });
      let idServiceRecu;
      let mesureRecue;
      let idUtilisateurRecu;
      testeur.depotDonnees().ajouteMesureSpecifiqueAuService = async (
        mesure,
        idUtilisateur,
        idService
      ) => {
        mesureRecue = mesure;
        idUtilisateurRecu = idUtilisateur;
        idServiceRecu = idService;
      };

      await testeur.post(
        '/api/service/456/mesuresSpecifiques',
        unePayloadValideSauf()
      );

      expect(idServiceRecu).to.be('456');
      expect(idUtilisateurRecu).to.be('999');
      expect(mesureRecue.description).to.be('une description');
      expect(mesureRecue.descriptionLongue).to.be('des détails');
      expect(mesureRecue.categorie).to.be('gouvernance');
      expect(mesureRecue.statut).to.be('fait');
    });

    describe('jette une erreur 400 si', () => {
      it('la description est invalide', async () => {
        const { status } = await testeur.post(
          '/api/service/456/mesuresSpecifiques',
          unePayloadValideSauf({ description: undefined })
        );

        expect(status).to.be(400);
      });

      it('la catégorie est invalide', async () => {
        const { status } = await testeur.post(
          '/api/service/456/mesuresSpecifiques',
          unePayloadValideSauf({ categorie: undefined })
        );

        expect(status).to.be(400);
      });

      it('le statut est invalide', async () => {
        const { status } = await testeur.post(
          '/api/service/456/mesuresSpecifiques',
          unePayloadValideSauf({ statut: 'pasUnStatut' })
        );

        expect(status).to.be(400);
      });

      it('la priorité est invalide', async () => {
        const { status } = await testeur.post(
          '/api/service/456/mesuresSpecifiques',
          unePayloadValideSauf({ priorite: 'invalide' })
        );

        expect(status).to.be(400);
      });

      it('… mais une priorité vide est acceptée', async () => {
        const { status } = await testeur.post(
          '/api/service/456/mesuresSpecifiques',
          unePayloadValideSauf({ priorite: '' })
        );

        expect(status).to.be(201);
      });

      it("l'échéance est invalide", async () => {
        const { status } = await testeur.post(
          '/api/service/456/mesuresSpecifiques',
          unePayloadValideSauf({ echeance: 'invalide' })
        );

        expect(status).to.be(400);
      });

      it('les modalités sont invalides', async () => {
        const { status } = await testeur.post(
          '/api/service/456/mesuresSpecifiques',
          unePayloadValideSauf({ modalites: 123 })
        );

        expect(status).to.be(400);
      });

      it('les responsables sont invalides', async () => {
        const { status } = await testeur.post(
          '/api/service/456/mesuresSpecifiques',
          unePayloadValideSauf({ responsables: ['pasUnUUID'] })
        );

        expect(status).to.be(400);
      });

      it('… mais des responsables non définis sont acceptés', async () => {
        const { status } = await testeur.post(
          '/api/service/456/mesuresSpecifiques',
          unePayloadValideSauf({ responsables: undefined })
        );

        expect(status).to.be(201);
      });

      it('la description longue est invalide', async () => {
        const { status } = await testeur.post(
          '/api/service/456/mesuresSpecifiques',
          unePayloadValideSauf({ descriptionLongue: 123 })
        );

        expect(status).to.be(400);
      });

      it('… mais la description longue est optionnelle', async () => {
        const { status } = await testeur.post(
          '/api/service/456/mesuresSpecifiques',
          unePayloadValideSauf({ descriptionLongue: undefined })
        );

        expect(status).to.be(201);
      });
    });
  });

  describe('quand requête DELETE sur `api/service/:id/mesuresSpecifiques/:idMesure`', () => {
    beforeEach(() => {
      testeur.depotDonnees().supprimeMesureSpecifiqueDuService = async () => {};
    });

    it("vérifie que l'utilisateur est authentifié", async () => {
      await testeur
        .middleware()
        .verifieRequeteExigeAcceptationCGU(testeur.app(), {
          method: 'delete',
          url: '/api/service/456/mesuresSpecifiques/789',
          data: [],
        });
    });

    it('recherche le service correspondant', async () => {
      await testeur
        .middleware()
        .verifieRechercheService(
          [{ niveau: ECRITURE, rubrique: SECURISER }],
          testeur.app(),
          {
            method: 'delete',
            url: '/api/service/456/mesuresSpecifiques/789',
            data: [],
          }
        );
    });

    it('délègue au dépôt de données la suppression de la mesure spécifique', async () => {
      const serviceARenvoyer = unService(testeur.referentiel())
        .avecId('456')
        .avecMesures(new Mesures({ mesuresSpecifiques: [{ id: 'M1' }] }))
        .construis();
      testeur.middleware().reinitialise({
        idUtilisateur: '999',
        serviceARenvoyer,
      });
      let idServiceRecu;
      let idUtilisateurRecu;
      let idMesureRecue;
      testeur.depotDonnees().supprimeMesureSpecifiqueDuService = async (
        idService,
        idUtilisateur,
        idMesure
      ) => {
        idServiceRecu = idService;
        idUtilisateurRecu = idUtilisateur;
        idMesureRecue = idMesure;
      };

      expect(serviceARenvoyer.nombreMesuresSpecifiques()).to.eql(1);
      await testeur.delete('/api/service/456/mesuresSpecifiques/M1');

      expect(idServiceRecu).to.be('456');
      expect(idUtilisateurRecu).to.be('999');
      expect(idMesureRecue).to.be('M1');
    });

    it('jette une erreur si la mesure spécifique est associée à un modèle', async () => {
      testeur.depotDonnees().supprimeMesureSpecifiqueDuService = async () => {
        throw new ErreurSuppressionImpossible();
      };

      const reponse = await testeur.delete(
        '/api/service/456/mesuresSpecifiques/M1'
      );
      expect(reponse.status).to.be(400);
    });
  });

  describe('quand requête PUT sur `api/service/:id/mesuresSpecifiques/:idMesure`', () => {
    beforeEach(() => {
      testeur.depotDonnees().metsAJourMesureSpecifiqueDuService =
        async () => {};
      testeur.referentiel().enrichis({
        categoriesMesures: { gouvernance: '' },
      });
      const serviceARenvoyer = unService(testeur.referentiel())
        .avecId('456')
        .avecMesures(new Mesures({ mesuresSpecifiques: [{ id: 'M1' }] }))
        .construis();
      testeur.middleware().reinitialise({
        idUtilisateur: '999',
        serviceARenvoyer,
      });
    });

    it("vérifie que l'utilisateur est authentifié", async () => {
      await testeur
        .middleware()
        .verifieRequeteExigeAcceptationCGU(testeur.app(), {
          method: 'put',
          url: '/api/service/456/mesuresSpecifiques/789',
          data: [],
        });
    });

    it('recherche le service correspondant', async () => {
      await testeur
        .middleware()
        .verifieRechercheService(
          [{ niveau: ECRITURE, rubrique: SECURISER }],
          testeur.app(),
          {
            method: 'put',
            url: '/api/service/456/mesuresSpecifiques/789',
            data: [],
          }
        );
    });

    it('aseptise tous les paramètres de la requête', async () => {
      await testeur
        .middleware()
        .verifieAseptisationParametres(
          [
            'description',
            'categorie',
            'statut',
            'modalites',
            'priorite',
            'echeance',
            'responsables.*',
          ],
          testeur.app(),
          {
            method: 'put',
            url: '/api/service/456/mesuresSpecifiques/789',
            data: [],
          }
        );
    });

    it('délègue au dépôt de données la mise à jour de la mesure spécifique', async () => {
      let idServiceRecu;
      let idUtilisateurRecu;
      let mesureRecue;
      testeur.depotDonnees().metsAJourMesureSpecifiqueDuService = async (
        idService,
        idUtilisateur,
        mesure
      ) => {
        idServiceRecu = idService;
        idUtilisateurRecu = idUtilisateur;
        mesureRecue = mesure;
      };

      await testeur.put('/api/service/456/mesuresSpecifiques/M1', {
        description: 'une description',
        categorie: 'gouvernance',
        statut: 'fait',
        echeance: '01&#x2F;01&#x2F;2024',
      });

      expect(idServiceRecu).to.be('456');
      expect(idUtilisateurRecu).to.be('999');
      expect(mesureRecue.description).to.be('une description');
      expect(mesureRecue.categorie).to.be('gouvernance');
      expect(mesureRecue.statut).to.be('fait');
      expect(mesureRecue.echeance.getTime()).to.be(
        new Date('01/01/2024').getTime()
      );
    });

    it('renvoi une erreur 404 si la mesure est introuvable', async () => {
      testeur.depotDonnees().metsAJourMesureSpecifiqueDuService = async () => {
        throw new ErreurMesureInconnue();
      };
      await testeur.verifieRequeteGenereErreurHTTP(
        404,
        'La mesure est introuvable',
        {
          method: 'put',
          url: '/api/service/456/mesuresSpecifiques/INTROUVABLE',
          data: {
            description: 'une description',
            categorie: 'gouvernance',
            statut: 'fait',
          },
        }
      );
    });

    it('renvoi une erreur 400 si la mesure est malformée', async () => {
      await testeur.verifieRequeteGenereErreurHTTP(
        400,
        'La catégorie "MAUVAISE_CATEGORIE" n\'est pas répertoriée',
        {
          method: 'put',
          url: '/api/service/456/mesuresSpecifiques/M1',
          data: {
            description: 'une description',
            categorie: 'MAUVAISE_CATEGORIE',
            statut: 'fait',
          },
        }
      );
    });

    it('renvoi une erreur 400 si le statut est vide', async () => {
      const reponse = await testeur.put(
        '/api/service/456/mesuresSpecifiques/M1',
        {
          description: 'une description',
          categorie: 'gouvernance',
          statut: '',
        }
      );
      expect(reponse.status).to.be(400);
      expect(reponse.text).to.be('Le statut de la mesure est obligatoire.');
    });
  });

  describe('quand requête PUT sur `/api/service/:id/mesures/:idMesure`', () => {
    beforeEach(() => {
      testeur.referentiel().recharge({
        mesures: { audit: {} },
      });
      testeur.middleware().reinitialise({
        idUtilisateur: '123',
        serviceARenvoyer: unService(testeur.referentiel())
          .avecId('456')
          .construis(),
      });
      testeur.depotDonnees().metsAJourMesureGeneraleDuService = () =>
        Promise.resolve();
    });

    it("vérifie que l'utilisateur a accepté les CGU", async () => {
      await testeur
        .middleware()
        .verifieRequeteExigeAcceptationCGU(testeur.app(), {
          method: 'put',
          url: '/api/service/456/mesures/audit',
        });
    });

    it('recherche le service correspondant', async () => {
      await testeur
        .middleware()
        .verifieRechercheService(
          [{ niveau: ECRITURE, rubrique: SECURISER }],
          testeur.app(),
          {
            method: 'put',
            url: '/api/service/456/mesures/audit',
          }
        );
    });

    it('aseptise les paramètres de la requête', async () => {
      await testeur
        .middleware()
        .verifieAseptisationParametres(
          ['statut', 'modalites', 'priorite', 'echeance', 'responsables.*'],
          testeur.app(),
          {
            method: 'put',
            url: '/api/service/456/mesures/audit',
          }
        );
    });

    it('jette une erreur 400 si le statut est vide', async () => {
      const mesureGenerale = {
        statut: '',
      };

      const reponse = await testeur.put(
        '/api/service/456/mesures/audit',
        mesureGenerale
      );
      expect(reponse.status).to.be(400);
      expect(reponse.text).to.be('Le statut de la mesure est obligatoire.');
    });

    it('délègue au dépôt de données la mise à jour des mesures générales', async () => {
      let donneesRecues;
      let idServiceRecu;
      let idUtilisateurRecu;
      testeur.depotDonnees().metsAJourMesureGeneraleDuService = (
        idService,
        idUtilisateur,
        donnees
      ) => {
        donneesRecues = donnees;
        idServiceRecu = idService;
        idUtilisateurRecu = idUtilisateur;
      };

      const mesureGenerale = {
        statut: 'fait',
      };

      await testeur.put('/api/service/456/mesures/audit', mesureGenerale);

      expect(idServiceRecu).to.equal('456');
      expect(idUtilisateurRecu).to.equal('123');
      expect(donneesRecues.id).to.equal('audit');
      expect(donneesRecues.statut).to.equal('fait');
    });

    it('renvoie une erreur 400 si la mesure est invalide à cause du statut', async () => {
      const mesureGenerale = {
        statut: 'invalide',
      };

      const reponse = await testeur.put(
        '/api/service/456/mesures/audit',
        mesureGenerale
      );
      expect(reponse.status).to.be(400);
      expect(reponse.text).to.be('La mesure est invalide.');
    });

    it('renvoie une erreur 400 si la mesure est invalide à cause de la priorité', async () => {
      const mesureGenerale = {
        priorite: 'invalide',
        statut: 'enCours',
      };

      const reponse = await testeur.put(
        '/api/service/456/mesures/audit',
        mesureGenerale
      );
      expect(reponse.status).to.be(400);
      expect(reponse.text).to.be('La mesure est invalide.');
    });

    it("renvoie une erreur 400 si la mesure est invalide à cause de l'échéance", async () => {
      const mesureGenerale = {
        echeance: 'invalide',
        statut: 'enCours',
      };

      const reponse = await testeur.put(
        '/api/service/456/mesures/audit',
        mesureGenerale
      );
      expect(reponse.status).to.be(400);
      expect(reponse.text).to.be('La mesure est invalide.');
    });

    it("décode les 'slash' de la date d'échéance", async () => {
      const slash = '&#x2F;';
      let donneesRecues;
      testeur.depotDonnees().metsAJourMesureGeneraleDuService = (
        _,
        __,
        donnees
      ) => {
        donneesRecues = donnees;
      };

      const mesureGenerale = {
        statut: 'fait',
        echeance: `01${slash}01${slash}2024`,
      };

      await testeur.put('/api/service/456/mesures/audit', mesureGenerale);

      expect(donneesRecues.echeance.getTime()).to.equal(
        new Date('01/01/2024').getTime()
      );
    });
  });

  describe('quand requête PUT sur `/api/service/:id/modeles/mesureSpecifique`', () => {
    beforeEach(() => {
      testeur.depotDonnees().associeModelesMesureSpecifiqueAuService =
        async () => {};
      const serviceARenvoyer = unService(testeur.referentiel())
        .avecId('S1')
        .construis();
      testeur.middleware().reinitialise({
        idUtilisateur: 'U1',
        serviceARenvoyer,
      });
    });

    it("vérifie que l'utilisateur a accepté les CGU", async () => {
      await testeur
        .middleware()
        .verifieRequeteExigeAcceptationCGU(testeur.app(), {
          method: 'put',
          url: '/api/service/S1/modeles/mesureSpecifique',
        });
    });

    it('recherche le service correspondant', async () => {
      await testeur
        .middleware()
        .verifieRechercheService(
          [{ niveau: ECRITURE, rubrique: SECURISER }],
          testeur.app(),
          {
            method: 'put',
            url: '/api/service/S1/modeles/mesureSpecifique',
          }
        );
    });

    it('aseptise les paramètres de la requête', async () => {
      await testeur
        .middleware()
        .verifieAseptisationParametres(['idsModeles.*'], testeur.app(), {
          method: 'put',
          url: '/api/service/S1/modeles/mesureSpecifique',
        });
    });

    it("délègue au dépôt de données l'association des modèles au service", async () => {
      let donnesRecues;
      testeur.depotDonnees().associeModelesMesureSpecifiqueAuService = async (
        idsModeles,
        idService,
        idUtilisateur
      ) => {
        donnesRecues = { idsModeles, idService, idUtilisateur };
      };

      await testeur.put('/api/service/S1/modeles/mesureSpecifique', {
        idsModeles: ['MOD-1', 'MOD-2'],
      });

      expect(donnesRecues.idsModeles).to.eql(['MOD-1', 'MOD-2']);
      expect(donnesRecues.idService).to.be('S1');
      expect(donnesRecues.idUtilisateur).to.be('U1');
    });

    it("jette une 403 si l'utilisateur ne possède pas un des modèles", async () => {
      testeur.depotDonnees().associeModelesMesureSpecifiqueAuService =
        async () => {
          throw new ErreurModeleDeMesureSpecifiqueIntrouvable();
        };

      const reponse = await testeur.put(
        '/api/service/S1/modeles/mesureSpecifique'
      );
      expect(reponse.status).to.be(403);
    });

    it("jette une 403 si l'utilisateur ne peut pas modifier tous les services passés en paramètres", async () => {
      testeur.depotDonnees().associeModelesMesureSpecifiqueAuService =
        async () => {
          throw new ErreurDroitsInsuffisantsPourModelesDeMesureSpecifique(
            'U1',
            ['S1'],
            {}
          );
        };
      const reponse = await testeur.put(
        '/api/service/S1/modeles/mesureSpecifique'
      );
      expect(reponse.status).to.be(403);
    });

    it("jette une 400 si le service est déjà associé à l'un des modèles", async () => {
      testeur.depotDonnees().associeModelesMesureSpecifiqueAuService =
        async () => {
          throw new ErreurModeleDeMesureSpecifiqueDejaAssociee();
        };

      const reponse = await testeur.put(
        '/api/service/S1/modeles/mesureSpecifique'
      );
      expect(reponse.status).to.be(400);
    });
  });

  describe('quand requête POST sur `/api/service/:id/rolesResponsabilites`', () => {
    beforeEach(() => {
      testeur.depotDonnees().ajouteRolesResponsabilitesAService = () =>
        Promise.resolve();
      testeur.depotDonnees().ajouteEntitesExternesAHomologation = () =>
        Promise.resolve();
    });

    it('recherche le service correspondant', async () => {
      await testeur
        .middleware()
        .verifieRechercheService(
          [{ niveau: ECRITURE, rubrique: CONTACTS }],
          testeur.app(),
          {
            method: 'post',
            url: '/api/service/456/rolesResponsabilites',
          }
        );
    });

    it("demande au dépôt d'associer les rôles et responsabilités au service", async () => {
      let rolesResponsabilitesAjoutees = false;

      testeur.depotDonnees().ajouteRolesResponsabilitesAService = async (
        idService,
        role
      ) => {
        expect(idService).to.equal('456');
        expect(role.autoriteHomologation).to.equal('Jean Dupont');
        rolesResponsabilitesAjoutees = true;
      };

      const reponse = await testeur.post(
        '/api/service/456/rolesResponsabilites',
        { autoriteHomologation: 'Jean Dupont' }
      );

      expect(rolesResponsabilitesAjoutees).to.be(true);
      expect(reponse.status).to.equal(200);
      expect(reponse.body).to.eql({ idService: '456' });
    });

    it("aseptise la liste des acteurs de l'homologation ainsi que son contenu", async () => {
      await testeur.post('/api/service/456/rolesResponsabilites', {});

      testeur
        .middleware()
        .verifieAseptisationListe('acteursHomologation', [
          'role',
          'nom',
          'fonction',
        ]);
    });

    it('aseptise la liste des parties prenantes ainsi que son contenu', async () => {
      await testeur.post('/api/service/456/rolesResponsabilites', {});

      testeur
        .middleware()
        .verifieAseptisationListe('partiesPrenantes', [
          'nom',
          'natureAcces',
          'pointContact',
        ]);
    });
  });

  describe('quand requête POST sur `/api/service/:id/risquesSpecifiques', () => {
    beforeEach(() => {
      testeur.referentiel().recharge({
        niveauxGravite: { unNiveau: {} },
        vraisemblancesRisques: { unNiveauVraisemblance: {} },
        categoriesRisques: { C1: {} },
      });
      testeur.depotDonnees().ajouteRisqueSpecifiqueAService = async () => {};
    });

    it('recherche le service correspondant', async () => {
      await testeur
        .middleware()
        .verifieRechercheService(
          [{ niveau: ECRITURE, rubrique: RISQUES }],
          testeur.app(),
          {
            method: 'post',
            url: '/api/service/456/risquesSpecifiques',
          }
        );
    });

    it('aseptise les paramètres de la requête', async () => {
      await testeur
        .middleware()
        .verifieAseptisationParametres(
          [
            'niveauGravite',
            'niveauVraisemblance',
            'commentaire',
            'description',
            'intitule',
            'categories.*',
          ],
          testeur.app(),
          {
            method: 'post',
            url: '/api/service/456/risquesSpecifiques',
          }
        );
    });

    it("retourne une erreur 400 si le niveau de gravité n'existe pas", async () => {
      const reponse = await testeur.post(
        '/api/service/456/risquesSpecifiques',
        {
          niveauGravite: 'inexistant',
          intitule: 'risque',
          categories: ['C1'],
        }
      );
      expect(reponse.status).to.be(400);
      expect(reponse.text).to.be('ErreurNiveauGraviteInconnu');
    });

    it("retourne une erreur 400 si le niveau de vraisemblance n'existe pas", async () => {
      const reponse = await testeur.post(
        '/api/service/456/risquesSpecifiques',
        {
          niveauVraisemblance: 'inexistant',
          intitule: 'risque',
          categories: ['C1'],
        }
      );
      expect(reponse.status).to.be(400);
      expect(reponse.text).to.be('ErreurNiveauVraisemblanceInconnu');
    });

    it("retourne une erreur 400 si l'intitulé est vide", async () => {
      const reponse = await testeur.post(
        '/api/service/456/risquesSpecifiques',
        { categories: ['C1'] }
      );

      expect(reponse.status).to.be(400);
      expect(reponse.text).to.be('ErreurIntituleRisqueManquant');
    });

    it("retourne une erreur 400 si la catégorie n'existe pas", async () => {
      const reponse = await testeur.post(
        '/api/service/456/risquesSpecifiques',
        {
          categories: ['inexistante'],
          intitule: 'un risque',
        }
      );

      expect(reponse.status).to.be(400);
      expect(reponse.text).to.be('ErreurCategorieRisqueInconnue');
    });

    it("délègue au dépôt de donnée l'ajout du risque", async () => {
      let idServiceRecu;
      let donneesRecues;
      testeur.depotDonnees().ajouteRisqueSpecifiqueAService = async (
        idService,
        donnees
      ) => {
        idServiceRecu = idService;
        donneesRecues = donnees;
        donnees.id = 'RS1';
      };

      await testeur.post('/api/service/456/risquesSpecifiques', {
        intitule: 'un risque important',
        niveauGravite: 'unNiveau',
        niveauVraisemblance: 'unNiveauVraisemblance',
        commentaire: "c'est important",
        categories: ['C1'],
      });

      expect(idServiceRecu).to.be('456');
      expect(donneesRecues.intitule).to.eql('un risque important');
      expect(donneesRecues.niveauGravite).to.eql('unNiveau');
      expect(donneesRecues.niveauVraisemblance).to.eql('unNiveauVraisemblance');
      expect(donneesRecues.commentaire).to.eql("c'est important");
    });

    it('retourne la représentation du risque ajouté', async () => {
      testeur.depotDonnees().ajouteRisqueSpecifiqueAService = async (
        _,
        risque
      ) => {
        risque.id = 'abcd';
        risque.identifiantNumerique = 'RS1';
      };

      const reponse = await testeur.post(
        '/api/service/456/risquesSpecifiques',
        {
          intitule: 'un risque important',
          niveauGravite: 'unNiveau',
          niveauVraisemblance: 'unNiveauVraisemblance',
          commentaire: "c'est important",
          categories: ['C1'],
        }
      );

      expect(reponse.body.id).to.be('abcd');
      expect(reponse.body.identifiantNumerique).to.be('RS1');
    });
  });

  describe('quand requête PUT sur `/api/service/:id/risquesSpecifiques', () => {
    beforeEach(() => {
      testeur.referentiel().recharge({
        niveauxGravite: { unNiveau: {} },
        categoriesRisques: { C1: {} },
        vraisemblancesRisques: { unNiveauVraisemblance: {} },
      });
      testeur.depotDonnees().metsAJourRisqueSpecifiqueDuService =
        async () => {};
      const serviceARenvoyer = unService(testeur.referentiel())
        .avecId('456')
        .avecRisques(
          new Risques({
            risquesSpecifiques: [
              { id: 'RS1', categories: ['C1'], intitule: 'intitule1' },
            ],
          })
        )
        .construis();
      testeur.middleware().reinitialise({
        idUtilisateur: '999',
        serviceARenvoyer,
      });
    });

    it('recherche le service correspondant', async () => {
      await testeur
        .middleware()
        .verifieRechercheService(
          [{ niveau: ECRITURE, rubrique: RISQUES }],
          testeur.app(),
          {
            method: 'put',
            url: '/api/service/456/risquesSpecifiques/RS1',
          }
        );
    });

    it('aseptise les paramètres de la requête', async () => {
      await testeur
        .middleware()
        .verifieAseptisationParametres(
          [
            'niveauGravite',
            'niveauVraisemblance',
            'commentaire',
            'description',
            'intitule',
            'categories.*',
          ],
          testeur.app(),
          {
            method: 'put',
            url: '/api/service/456/risquesSpecifiques/RS1',
          }
        );
    });

    it("retourne une erreur 400 si le niveau de gravité n'existe pas", async () => {
      const reponse = await testeur.put(
        '/api/service/456/risquesSpecifiques/RS1',
        {
          niveauGravite: 'inexistant',
          intitule: 'risque',
          categories: ['C1'],
        }
      );
      expect(reponse.status).to.be(400);
      expect(reponse.text).to.be('ErreurNiveauGraviteInconnu');
    });

    it("retourne une erreur 400 si le niveau de vraisemblance n'existe pas", async () => {
      const reponse = await testeur.put(
        '/api/service/456/risquesSpecifiques/RS1',
        {
          niveauVraisemblance: 'inexistant',
          intitule: 'risque',
          categories: ['C1'],
        }
      );

      expect(reponse.status).to.be(400);
      expect(reponse.text).to.be('ErreurNiveauVraisemblanceInconnu');
    });

    it("retourne une erreur 400 si l'intitulé est vide", async () => {
      const reponse = await testeur.put(
        '/api/service/456/risquesSpecifiques/RS1',
        {
          categories: ['C1'],
        }
      );
      expect(reponse.status).to.be(400);
      expect(reponse.text).to.be('ErreurIntituleRisqueManquant');
    });

    it("retourne une erreur 400 si la catégorie n'existe pas", async () => {
      const reponse = await testeur.put(
        '/api/service/456/risquesSpecifiques/RS1',
        {
          categories: ['inexistante'],
          intitule: 'un risque',
        }
      );

      expect(reponse.status).to.be(400);
      expect(reponse.text).to.be('ErreurCategorieRisqueInconnue');
    });

    it('renvoi une erreur 404 si le risque est introuvable', async () => {
      testeur.depotDonnees().metsAJourRisqueSpecifiqueDuService = async () => {
        throw new ErreurRisqueInconnu();
      };
      await testeur.verifieRequeteGenereErreurHTTP(
        404,
        'Le risque est introuvable',
        {
          method: 'put',
          url: '/api/service/456/risquesSpecifiques/INTROUVABLE',
          data: {
            intitule: 'un risque important',
            categories: ['C1'],
          },
        }
      );
    });

    it('délègue au dépôt de donnée la mise à jour du risque', async () => {
      let idServiceRecu;
      let donneesRecues;
      testeur.depotDonnees().metsAJourRisqueSpecifiqueDuService = async (
        idService,
        donnees
      ) => {
        idServiceRecu = idService;
        donneesRecues = donnees;
      };

      await testeur.put('/api/service/456/risquesSpecifiques/RS1', {
        intitule: 'un risque important',
        niveauGravite: 'unNiveau',
        niveauVraisemblance: 'unNiveauVraisemblance',
        commentaire: "c'est important",
        categories: ['C1'],
      });

      expect(idServiceRecu).to.be('456');
      expect(donneesRecues.id).to.eql('RS1');
      expect(donneesRecues.intitule).to.eql('un risque important');
      expect(donneesRecues.niveauGravite).to.eql('unNiveau');
      expect(donneesRecues.niveauVraisemblance).to.eql('unNiveauVraisemblance');
      expect(donneesRecues.commentaire).to.eql("c'est important");
    });

    it('retourne la représentation du risque modifié', async () => {
      testeur.depotDonnees().metsAJourRisqueSpecifiqueDuService =
        async () => {};

      const reponse = await testeur.put(
        '/api/service/456/risquesSpecifiques/RS1',
        {
          intitule: 'un risque important',
          niveauGravite: 'unNiveau',
          niveauVraisemblance: 'unNiveauVraisemblance',
          commentaire: "c'est important",
          categories: ['C1'],
        }
      );

      expect(reponse.body.intitule).to.be('un risque important');
    });
  });

  describe('quand requête DELETE sur `/api/service/:id/risquesSpecifiques/:idRisque', () => {
    beforeEach(() => {
      testeur.depotDonnees().supprimeRisqueSpecifiqueDuService = async () => {};
    });

    it('recherche le service correspondant', async () => {
      await testeur
        .middleware()
        .verifieRechercheService(
          [{ niveau: ECRITURE, rubrique: RISQUES }],
          testeur.app(),
          {
            method: 'delete',
            url: '/api/service/456/risquesSpecifiques/RS1',
          }
        );
    });

    it('délègue au dépôt de donnée la suppression du risque', async () => {
      let idServiceRecu;
      let idRisqueRecu;
      testeur.depotDonnees().supprimeRisqueSpecifiqueDuService = async (
        idService,
        idRisque
      ) => {
        idServiceRecu = idService;
        idRisqueRecu = idRisque;
      };

      await testeur.delete('/api/service/456/risquesSpecifiques/RS1');

      expect(idServiceRecu).to.be('456');
      expect(idRisqueRecu).to.be('RS1');
    });
  });

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

  describe('quand requête PUT sur /api/service/:id/homologation/autorite', () => {
    beforeEach(() => {
      const serviceAvecDossier = new Service({
        id: '456',
        descriptionService: { nomService: 'un service' },
        dossiers: [{ id: '999' }],
      });
      testeur
        .middleware()
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

      expect(status).to.be(400);
    });

    it('jette une erreur si la fonction est invalide', async () => {
      const { status } = await testeur.put(
        '/api/service/456/homologation/autorite',
        { nom: 'Jean Duj', fonction: undefined }
      );

      expect(status).to.be(400);
    });

    it("utilise le dépôt pour enregistrer l'autorité d'homologation", async () => {
      let depotAppele = false;

      testeur.depotDonnees().enregistreDossier = async (
        idHomologation,
        dossier
      ) => {
        depotAppele = true;
        expect(idHomologation).to.equal('456');
        expect(dossier.autorite.nom).to.equal('Jean Dupond');
        expect(dossier.autorite.fonction).to.equal('RSSI');
      };

      await testeur.put('/api/service/456/homologation/autorite', {
        nom: 'Jean Dupond',
        fonction: 'RSSI',
      });

      expect(depotAppele).to.be(true);
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
      expect(reponse.status).to.be(422);
      expect(reponse.text).to.be("Date d'homologation invalide");
    });

    it('renvoie une erreur 422 si la durée de validité est inconnue du référentiel', async () => {
      const reponse = await testeur.put(
        '/api/service/456/homologation/decision',
        {
          dateHomologation: new Date(),
          dureeValidite: 'dureeInconnue',
        }
      );
      expect(reponse.status).to.be(422);
      expect(reponse.text).to.be('Durée de validité invalide');
    });

    it("utilise le dépôt pour enregistrer la décision d'homologation", async () => {
      let depotAppele = false;

      testeur.depotDonnees().enregistreDossier = (idHomologation, dossier) => {
        depotAppele = true;
        expect(idHomologation).to.equal('456');
        expect(dossier.decision.dateHomologation).to.equal('2023-01-01');
        expect(dossier.decision.dureeValidite).to.equal('unAn');
        return Promise.resolve();
      };

      await testeur.put('/api/service/456/homologation/decision', {
        dateHomologation: '2023-01-01',
        dureeValidite: 'unAn',
      });
      expect(depotAppele).to.be(true);
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
        idHomologation,
        dossier
      ) => {
        depotAppele = true;
        expect(idHomologation).to.equal('456');
        expect(dossier.dateTelechargement.date).to.equal(maintenant);
      };

      await testeur.put('/api/service/456/homologation/telechargement');
      expect(depotAppele).to.be(true);
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
      expect(reponse.status).to.be(400);
    });

    describe('utilise le dépôt pour enregistrer les avis', () => {
      it('quand il y a des avis', async () => {
        let depotAppele = false;
        testeur.depotDonnees().enregistreDossier = (
          idHomologation,
          dossier
        ) => {
          depotAppele = true;
          expect(idHomologation).to.equal('456');
          expect(dossier.avis.avis.length).to.equal(1);
          expect(dossier.avis.avecAvis).to.be(true);
          expect(dossier.avis.avis[0].donneesSerialisees()).to.eql({
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
        expect(depotAppele).to.be(true);
      });

      it("quand il n'y a pas d'avis", async () => {
        let depotAppele = false;
        testeur.depotDonnees().enregistreDossier = (
          idHomologation,
          dossier
        ) => {
          depotAppele = true;
          expect(idHomologation).to.equal('456');
          expect(dossier.avis.avis.length).to.equal(0);
          expect(dossier.avis.avecAvis).to.be(false);
          return Promise.resolve();
        };

        await testeur.put('/api/service/456/homologation/avis', {
          avis: [],
          avecAvis: 'false',
        });
        expect(depotAppele).to.be(true);
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
      expect(reponse.status).to.be(400);
    });

    describe('utilise le dépôt pour enregistrer les documents', () => {
      it('quand il y a des documents', async () => {
        let depotAppele = false;
        testeur.depotDonnees().enregistreDossier = (
          idHomologation,
          dossier
        ) => {
          depotAppele = true;
          expect(idHomologation).to.equal('456');
          expect(dossier.documents.documents.length).to.equal(1);
          expect(dossier.documents.avecDocuments).to.be(true);
          expect(dossier.documents.documents[0]).to.eql('unDocument');
          return Promise.resolve();
        };

        await testeur.put('/api/service/456/homologation/documents', {
          documents: ['unDocument'],
          avecDocuments: 'true',
        });
        expect(depotAppele).to.be(true);
      });

      it("quand il n'y a pas de document", async () => {
        let depotAppele = false;
        testeur.depotDonnees().enregistreDossier = (
          idHomologation,
          dossier
        ) => {
          depotAppele = true;
          expect(idHomologation).to.equal('456');
          expect(dossier.documents.documents.length).to.equal(0);
          expect(dossier.documents.avecDocuments).to.be(false);
          return Promise.resolve();
        };

        await testeur.put('/api/service/456/homologation/documents', {
          documents: [],
          avecDocuments: 'false',
        });
        expect(depotAppele).to.be(true);
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
      let servicePasse = {};
      testeur.depotDonnees().finaliseDossierCourant = async (service) => {
        servicePasse = service;
      };

      await testeur.post('/api/service/456/homologation/finalise');

      expect(servicePasse.id).to.equal('456');
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

  describe('quand requête POST sur `/api/service/:id/retourUtilisateurMesure', () => {
    it('recherche le service correspondant', async () => {
      await testeur
        .middleware()
        .verifieRechercheService(
          [{ niveau: ECRITURE, rubrique: SECURISER }],
          testeur.app(),
          {
            method: 'post',
            url: '/api/service/456/retourUtilisateurMesure',
          }
        );
    });

    it('aseptise les données de la requête', async () => {
      await testeur
        .middleware()
        .verifieAseptisationParametres(
          ['id', 'idMesure', 'idRetour', 'commentaire'],
          testeur.app(),
          {
            method: 'post',
            url: '/api/service/456/retourUtilisateurMesure',
          }
        );
    });

    it("retourne une erreur HTTP 424 si l'id du retour utilisateur est inconnu", async () => {
      await testeur.verifieRequeteGenereErreurHTTP(
        424,
        {
          type: 'DONNEES_INCORRECTES',
          message: "L'identifiant de retour utilisateur est incorrect.",
        },
        {
          method: 'post',
          url: '/api/service/456/retourUtilisateurMesure',
          data: { idRetour: 'idRetourInconnu' },
        }
      );
    });

    it("retourne une erreur HTTP 424 si l'id de mesure est inconnu", async () => {
      testeur.referentiel().recharge({
        retoursUtilisateurMesure: { idRetour: 'un retour utilisateur' },
      });
      testeur.middleware().reinitialise({
        serviceARenvoyer: unService(testeur.referentiel())
          .avecId('456')
          .construis(),
      });
      await testeur.verifieRequeteGenereErreurHTTP(
        424,
        {
          type: 'DONNEES_INCORRECTES',
          message: "L'identifiant de mesure est incorrect.",
        },
        {
          method: 'post',
          url: '/api/service/456/retourUtilisateurMesure',
          data: { idMesure: 'idMesureInconnu', idRetour: 'idRetour' },
        }
      );
    });

    it('consigne un événement de retour utilisateur sur une mesure', async () => {
      testeur.referentiel().recharge({
        retoursUtilisateurMesure: { bonneMesure: 'mesure satisfaisante' },
        mesures: { implementerMfa: {} },
      });
      testeur.middleware().reinitialise({
        idUtilisateur: '123',
        serviceARenvoyer: unService(testeur.referentiel())
          .avecId('456')
          .construis(),
      });
      let evenementRecu = {};
      testeur.adaptateurJournalMSS().consigneEvenement = async (donnees) => {
        evenementRecu = donnees;
      };

      await testeur.post('/api/service/456/retourUtilisateurMesure', {
        idMesure: 'implementerMfa',
        idRetour: 'bonneMesure',
        commentaire: 'un commentaire',
      });

      expect(evenementRecu.type).to.equal('RETOUR_UTILISATEUR_MESURE_RECU');
    });
  });

  describe('quand requête DELETE sur `/api/service/:id/homologation/dossierCourant`', () => {
    beforeEach(() => {
      testeur.middleware().reinitialise({
        autorisationACharger: Autorisation.NouvelleAutorisationProprietaire(),
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
        echeancesRenouvellement: { unAn: {} },
        statutsAvisDossierHomologation: { favorable: {} },
      });
      const service = unService(referentiel)
        .avecId('123')
        .avecDossiers([
          unDossier(referentiel).quiEstComplet().quiEstNonFinalise().donnees,
        ])
        .construis();
      let serviceMisAJour;

      testeur.middleware().reinitialise({ serviceARenvoyer: service });
      testeur.depotDonnees().metsAJourService = async (s) => {
        serviceMisAJour = s;
      };

      await testeur.delete('/api/service/123/homologation/dossierCourant');

      expect(serviceMisAJour.id).to.be('123');
    });
  });

  describe('quand requête POST sur `/api/service/estimationNiveauSecurite`', () => {
    it("vérifie que l'utilisateur est authentifié", async () => {
      await testeur
        .middleware()
        .verifieRequeteExigeAcceptationCGU(testeur.app(), {
          method: 'post',
          url: '/api/service/estimationNiveauSecurite',
        });
    });

    it('aseptise les paramètres', async () => {
      await testeur
        .middleware()
        .verifieAseptisationParametres(
          [
            'nomService',
            'organisationsResponsables.*',
            'nombreOrganisationsUtilisatrices.*',
          ],
          testeur.app(),
          {
            method: 'post',
            url: '/api/service/estimationNiveauSecurite',
          }
        );
    });

    it('aseptise les listes de paramètres ainsi que leur contenu', async () => {
      await testeur.post('/api/service/estimationNiveauSecurite');

      testeur
        .middleware()
        .verifieAseptisationListe('pointsAcces', ['description']);
      testeur
        .middleware()
        .verifieAseptisationListe('fonctionnalitesSpecifiques', [
          'description',
        ]);
      testeur
        .middleware()
        .verifieAseptisationListe('donneesSensiblesSpecifiques', [
          'description',
        ]);
    });

    it("retourne l'estimation du niveau de sécurité pour la description donnée", async () => {
      const donneesDescriptionNiveau1 = { nomService: 'Mon service' };
      const resultat = await testeur.post(
        '/api/service/estimationNiveauSecurite',
        donneesDescriptionNiveau1
      );

      expect(resultat.status).to.be(200);
      expect(resultat.body.niveauDeSecuriteMinimal).to.be('niveau1');
    });

    it('retourne une erreur HTTP 400 si les données de description de service sont invalides', async () => {
      const donneesInvalides = { statutDeploiement: 'statutInvalide' };
      await testeur.verifieRequeteGenereErreurHTTP(
        400,
        'La description du service est invalide',
        {
          method: 'post',
          url: '/api/service/estimationNiveauSecurite',
          data: donneesInvalides,
        }
      );
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
});
