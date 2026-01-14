import expect from 'expect.js';
import testeurMSS from '../testeurMSS.js';
import {
  ErreurAutorisationInexistante,
  ErreurDroitsInsuffisantsPourModelesDeMesureSpecifique,
  ErreurModeleDeMesureSpecifiqueDejaAssociee,
  ErreurModeleDeMesureSpecifiqueIntrouvable,
  ErreurNombreLimiteModelesMesureSpecifiqueAtteint,
  ErreurServiceInexistant,
} from '../../../src/erreurs.js';

describe('Le serveur MSS des routes privées /api/modeles/mesureSpecifique/*', () => {
  const testeur = testeurMSS();

  beforeEach(() => testeur.initialise());

  it("vérifie que l'utilisateur est authentifié sur toutes les routes", async () => {
    // On vérifie une seule route privée de modèls de mesure spécifique.
    // Par construction, les autres seront protégées aussi puisque la protection est ajoutée comme middleware
    // devant le routeur dédié à ces routes.
    await testeur
      .middleware()
      .verifieRequeteExigeAcceptationCGU(
        testeur.app(),
        '/api/modeles/mesureSpecifique'
      );
  });

  describe('quand requête GET sur `/api/modeles/mesureSpecifique`', () => {
    it("délègue au dépôt de données la lecture des modèles de mesure spécifique de l'utilisateur courant", async () => {
      let idRecu;
      testeur.middleware().reinitialise({ idUtilisateur: 'U1' });
      testeur.depotDonnees().lisModelesMesureSpecifiquePourUtilisateur = async (
        idUtilisateur
      ) => {
        idRecu = idUtilisateur;
        return [];
      };

      const reponse = await testeur.get('/api/modeles/mesureSpecifique');

      expect(reponse.status).to.be(200);
      expect(reponse.body).to.eql([]);
      expect(idRecu).to.be('U1');
    });
  });

  describe('quand requête POST sur `/api/modeles/mesureSpecifique`', () => {
    const unePayloadValide = () => ({
      description: 'une description',
      descriptionLongue: 'une description longue',
      categorie: 'gouvernance',
    });

    beforeEach(() => {
      testeur
        .referentiel()
        .recharge({ categoriesMesures: { gouvernance: {} } });
      testeur.middleware().reinitialise({ idUtilisateur: 'U1' });
      testeur.depotDonnees().ajouteModeleMesureSpecifique = async () => {};
    });

    it('jette une erreur si la catégorie est invalide', async () => {
      const reponse = await testeur.post('/api/modeles/mesureSpecifique', {
        ...unePayloadValide(),
        categorie: 'pasUneCategorie',
      });

      expect(reponse.status).to.be(400);
    });

    it("jette une erreur si la description n'est pas renseignée", async () => {
      const reponse = await testeur.post('/api/modeles/mesureSpecifique', {
        ...unePayloadValide(),
        description: '',
      });

      expect(reponse.status).to.be(400);
    });

    it("jette une erreur si la description longue n'est pas renseignée", async () => {
      const reponse = await testeur.post('/api/modeles/mesureSpecifique', {
        ...unePayloadValide(),
        descriptionLongue: undefined,
      });

      expect(reponse.status).to.be(400);
    });

    it("délègue au dépôt de données l'ajout du modèle de mesure spécifique", async () => {
      let donneesRecues;
      testeur.depotDonnees().ajouteModeleMesureSpecifique = async (
        idUtilisateur,
        donnees
      ) => {
        donneesRecues = { idUtilisateur, donnees };
      };

      await testeur.post('/api/modeles/mesureSpecifique', unePayloadValide());

      expect(donneesRecues.idUtilisateur).to.be('U1');
      expect(donneesRecues.donnees).to.eql({
        description: 'une description',
        descriptionLongue: 'une description longue',
        categorie: 'gouvernance',
      });
    });

    it('jette une erreur si la limite de création de modèles est atteinte', async () => {
      testeur.depotDonnees().ajouteModeleMesureSpecifique = async () => {
        throw new ErreurNombreLimiteModelesMesureSpecifiqueAtteint();
      };

      const reponse = await testeur.post(
        '/api/modeles/mesureSpecifique',
        unePayloadValide()
      );
      expect(reponse.status).to.be(403);
      expect(reponse.text).to.be('Limite de création atteinte');
    });

    it("retourne 201 et l'identifiant du modèle créé", async () => {
      testeur.depotDonnees().ajouteModeleMesureSpecifique = async () => 'MOD-1';

      const reponse = await testeur.post(
        '/api/modeles/mesureSpecifique',
        unePayloadValide()
      );

      expect(reponse.status).to.be(201);
      expect(reponse.body).to.eql({
        id: 'MOD-1',
      });
    });
  });

  describe('quand requête PUT sur `/api/modeles/mesureSpecifique/idModele`', () => {
    beforeEach(() => {
      testeur.referentiel().recharge({
        categoriesMesures: {
          gouvernance: {},
        },
      });
      testeur.middleware().reinitialise({ idUtilisateur: 'U1' });
    });

    it('aseptise les paramètres de la requête', async () => {
      await testeur
        .middleware()
        .verifieAseptisationParametres(
          ['description', 'descriptionLongue', 'categorie'],
          testeur.app(),
          {
            method: 'put',
            url: '/api/modeles/mesureSpecifique/unIdDeModele',
          }
        );
    });

    it("jette une erreur si le modele de mesure spécifique n'existe pas", async () => {
      testeur.depotDonnees().lisModelesMesureSpecifiquePourUtilisateur =
        async () => [];

      const reponse = await testeur.put(
        '/api/modeles/mesureSpecifique/unIdInexistant',
        {
          description: 'une description',
          descriptionLongue: 'une description longue',
          categorie: 'gouvernance',
        }
      );

      expect(reponse.status).to.be(404);
    });

    describe('quand le modèle de mesure spécifique existe', () => {
      beforeEach(() => {
        testeur.depotDonnees().lisModelesMesureSpecifiquePourUtilisateur =
          async () => [
            {
              id: 'MOD-1',
              description: 'une description',
              categorie: 'gouvernance',
              descriptionLongue: 'une description longue',
            },
          ];
      });

      it('jette une erreur si la catégorie est invalide', async () => {
        const reponse = await testeur.put(
          '/api/modeles/mesureSpecifique/MOD-1',
          {
            description: 'une description',
            descriptionLongue: 'une description longue',
            categorie: 'une categorie invalide',
          }
        );

        expect(reponse.status).to.be(400);
        expect(reponse.text).to.be('La catégorie est invalide');
      });

      it("jette une erreur si la description n'est pas renseignée", async () => {
        const reponse = await testeur.put(
          '/api/modeles/mesureSpecifique/MOD-1',
          {
            description: '',
            descriptionLongue: 'une description longue',
            categorie: 'gouvernance',
          }
        );

        expect(reponse.status).to.be(400);
        expect(reponse.text).to.be('La description est obligatoire');
      });

      it('délègue au dépôt de données la mise à jour du modèle de mesure spécifique', async () => {
        let donneesRecues;
        testeur.depotDonnees().metsAJourModeleMesureSpecifique = async (
          idUtilisateur,
          idModele,
          donnees
        ) => {
          donneesRecues = { idUtilisateur, idModele, donnees };
        };

        const reponse = await testeur.put(
          '/api/modeles/mesureSpecifique/MOD-1',
          {
            description: 'une description',
            descriptionLongue: 'une description longue',
            categorie: 'gouvernance',
          }
        );

        expect(donneesRecues.idUtilisateur).to.be('U1');
        expect(donneesRecues.idModele).to.be('MOD-1');
        expect(donneesRecues.donnees).to.eql({
          description: 'une description',
          descriptionLongue: 'une description longue',
          categorie: 'gouvernance',
        });
        expect(reponse.status).to.be(200);
      });
    });
  });

  describe('quand requête PUT sur `/api/modeles/mesureSpecifique/:idModele/services`', () => {
    beforeEach(() => {
      testeur.middleware().reinitialise({ idUtilisateur: 'U1' });
      testeur.depotDonnees().associeModeleMesureSpecifiqueAuxServices =
        () => {};
      testeur.depotDonnees().lisModelesMesureSpecifiquePourUtilisateur =
        async () => [
          {
            id: 'MOD-1',
            description: 'une description',
            categorie: 'gouvernance',
            descriptionLongue: 'une description longue',
          },
        ];
    });

    it('aseptise les paramètres de la requête', async () => {
      await testeur
        .middleware()
        .verifieAseptisationParametres(
          ['idsServicesAAssocier.*'],
          testeur.app(),
          {
            method: 'put',
            url: '/api/modeles/mesureSpecifique/MOD-1/services',
          }
        );
    });

    it("jette une erreur si le modele de mesure spécifique n'existe pas", async () => {
      const reponse = await testeur.put(
        '/api/modeles/mesureSpecifique/unIdInexistant/services'
      );

      expect(reponse.status).to.be(404);
    });

    it("délègue au dépôt de données l'association des services au modèle de mesure spécifique", async () => {
      let donneesRecues;
      testeur.depotDonnees().associeModeleMesureSpecifiqueAuxServices = async (
        idModele,
        idsServices,
        idUtilisateurAssociant
      ) => {
        donneesRecues = { idModele, idsServices, idUtilisateurAssociant };
      };

      const reponse = await testeur.put(
        '/api/modeles/mesureSpecifique/MOD-1/services',
        {
          idsServicesAAssocier: ['S1', 'S2'],
        }
      );

      expect(donneesRecues.idUtilisateurAssociant).to.be('U1');
      expect(donneesRecues.idModele).to.be('MOD-1');
      expect(donneesRecues.idsServices).to.eql(['S1', 'S2']);
      expect(reponse.status).to.be(200);
    });

    it('jette une erreur si un service est déjà associé', async () => {
      testeur.depotDonnees().associeModeleMesureSpecifiqueAuxServices =
        async () => {
          throw new ErreurModeleDeMesureSpecifiqueDejaAssociee();
        };
      const reponse = await testeur.put(
        '/api/modeles/mesureSpecifique/MOD-1/services'
      );
      expect(reponse.status).to.be(400);
    });

    it('jette une erreur si les droits de modification de services sont insuffisants', async () => {
      testeur.depotDonnees().associeModeleMesureSpecifiqueAuxServices =
        async () => {
          throw new ErreurDroitsInsuffisantsPourModelesDeMesureSpecifique();
        };
      const reponse = await testeur.put(
        '/api/modeles/mesureSpecifique/MOD-1/services'
      );
      expect(reponse.status).to.be(403);
    });

    it("jette une erreur si l'utilisateur ne possède pas le modèle", async () => {
      testeur.depotDonnees().associeModeleMesureSpecifiqueAuxServices =
        async () => {
          throw new ErreurAutorisationInexistante();
        };
      const reponse = await testeur.put(
        '/api/modeles/mesureSpecifique/MOD-1/services'
      );
      expect(reponse.status).to.be(404);
    });

    it("jette une erreur si l'un des services n'existe pas", async () => {
      testeur.depotDonnees().associeModeleMesureSpecifiqueAuxServices =
        async () => {
          throw new ErreurServiceInexistant();
        };
      const reponse = await testeur.put(
        '/api/modeles/mesureSpecifique/MOD-1/services'
      );
      expect(reponse.status).to.be(400);
    });
  });

  describe('quand requête DELETE sur `/api/modeles/mesureSpecifique/:idModele`', () => {
    beforeEach(() => {
      testeur.middleware().reinitialise({ idUtilisateur: 'U1' });
      testeur.depotDonnees().supprimeModeleMesureSpecifiqueEtMesuresAssociees =
        () => {};
      testeur.depotDonnees().supprimeModeleMesureSpecifiqueEtDetacheMesuresAssociees =
        () => {};
    });

    it('aseptise les paramètres de la requête', async () => {
      await testeur
        .middleware()
        .verifieAseptisationParametres(['detacheMesures'], testeur.app(), {
          method: 'delete',
          url: '/api/modeles/mesureSpecifique/MOD-1',
        });
    });

    describe('sans paramètre pour conserver les mesures associées', () => {
      it('délègue au dépôt de données la suppression du service', async () => {
        let donneesRecues;
        testeur.depotDonnees().supprimeModeleMesureSpecifiqueEtMesuresAssociees =
          async (idUtilisateur, idModele) => {
            donneesRecues = { idUtilisateur, idModele };
          };

        await testeur.delete('/api/modeles/mesureSpecifique/MOD-1');

        expect(donneesRecues.idUtilisateur).to.be('U1');
        expect(donneesRecues.idModele).to.be('MOD-1');
      });

      it("jette une 404 si le modele n'existe pas", async () => {
        testeur.depotDonnees().supprimeModeleMesureSpecifiqueEtMesuresAssociees =
          async () => {
            throw new ErreurModeleDeMesureSpecifiqueIntrouvable(
              'MOD-INEXISTANT'
            );
          };
        const reponse = await testeur.delete(
          '/api/modeles/mesureSpecifique/MOD-INEXISTANT'
        );
        expect(reponse.status).to.be(404);
      });

      it("jette une 403 si l'utilisateur ne possède pas le modèle", async () => {
        testeur.depotDonnees().supprimeModeleMesureSpecifiqueEtMesuresAssociees =
          async () => {
            throw new ErreurAutorisationInexistante();
          };
        const reponse = await testeur.delete(
          '/api/modeles/mesureSpecifique/MOD-1'
        );
        expect(reponse.status).to.be(403);
      });

      it("jette une 403 si l'utilisateur ne peut pas modifier tous les services associés", async () => {
        testeur.depotDonnees().supprimeModeleMesureSpecifiqueEtMesuresAssociees =
          async () => {
            throw new ErreurDroitsInsuffisantsPourModelesDeMesureSpecifique(
              'U1',
              ['S1'],
              {}
            );
          };
        const reponse = await testeur.delete(
          '/api/modeles/mesureSpecifique/MOD-1'
        );
        expect(reponse.status).to.be(403);
      });
    });
    describe('avec paramètre pour détacher les mesures associées', () => {
      it('délègue au dépôt de données la suppression du service et le détachement des mesures associées', async () => {
        let donneesRecues;
        testeur.depotDonnees().supprimeModeleMesureSpecifiqueEtDetacheMesuresAssociees =
          async (idUtilisateur, idModele) => {
            donneesRecues = { idUtilisateur, idModele };
          };

        await testeur.delete(
          '/api/modeles/mesureSpecifique/MOD-1?detacheMesures=true'
        );

        expect(donneesRecues.idUtilisateur).to.be('U1');
        expect(donneesRecues.idModele).to.be('MOD-1');
      });
    });

    it("jette une 404 si le modele n'existe pas", async () => {
      testeur.depotDonnees().supprimeModeleMesureSpecifiqueEtDetacheMesuresAssociees =
        async () => {
          throw new ErreurModeleDeMesureSpecifiqueIntrouvable('MOD-INEXISTANT');
        };
      const reponse = await testeur.delete(
        '/api/modeles/mesureSpecifique/MOD-INEXISTANT?detacheMesures=true'
      );
      expect(reponse.status).to.be(404);
    });

    it("jette une 403 si l'utilisateur ne possède pas le modèle", async () => {
      testeur.depotDonnees().supprimeModeleMesureSpecifiqueEtDetacheMesuresAssociees =
        async () => {
          throw new ErreurAutorisationInexistante();
        };
      const reponse = await testeur.delete(
        '/api/modeles/mesureSpecifique/MOD-1?detacheMesures=true'
      );
      expect(reponse.status).to.be(403);
    });

    it("jette une 403 si l'utilisateur ne peut pas modifier tous les services associés", async () => {
      testeur.depotDonnees().supprimeModeleMesureSpecifiqueEtDetacheMesuresAssociees =
        async () => {
          throw new ErreurDroitsInsuffisantsPourModelesDeMesureSpecifique(
            'U1',
            ['S1'],
            {}
          );
        };
      const reponse = await testeur.delete(
        '/api/modeles/mesureSpecifique/MOD-1?detacheMesures=true'
      );
      expect(reponse.status).to.be(403);
    });
  });

  describe('quand requête DELETE sur `/api/modeles/mesureSpecifique/:idModele/services`', () => {
    beforeEach(() => {
      testeur.middleware().reinitialise({ idUtilisateur: 'U1' });
      testeur.depotDonnees().supprimeDesMesuresAssocieesAuModele =
        async () => {};
    });

    it('aseptise les paramètres de la requête', async () => {
      await testeur
        .middleware()
        .verifieAseptisationParametres(['idsServices.*'], testeur.app(), {
          method: 'delete',
          url: '/api/modeles/mesureSpecifique/MOD-1/services',
        });
    });

    it('délègue au dépôt de données la suppression des mesures associées au modèle', async () => {
      let donneesRecues;
      testeur.depotDonnees().supprimeDesMesuresAssocieesAuModele = async (
        idUtilisateur,
        idModele,
        idsServices
      ) => {
        donneesRecues = { idUtilisateur, idModele, idsServices };
      };

      await testeur.delete('/api/modeles/mesureSpecifique/MOD-1/services', {
        idsServices: ['S1'],
      });

      expect(donneesRecues.idUtilisateur).to.be('U1');
      expect(donneesRecues.idModele).to.be('MOD-1');
      expect(donneesRecues.idsServices).to.eql(['S1']);
    });

    it("jette une 404 si le modele n'existe pas", async () => {
      testeur.depotDonnees().supprimeDesMesuresAssocieesAuModele = async () => {
        throw new ErreurModeleDeMesureSpecifiqueIntrouvable('MOD-INEXISTANT');
      };
      const reponse = await testeur.delete(
        '/api/modeles/mesureSpecifique/MOD-INEXISTANT/services'
      );
      expect(reponse.status).to.be(404);
    });

    it("jette une 403 si l'utilisateur ne possède pas le modèle", async () => {
      testeur.depotDonnees().supprimeDesMesuresAssocieesAuModele = async () => {
        throw new ErreurAutorisationInexistante();
      };
      const reponse = await testeur.delete(
        '/api/modeles/mesureSpecifique/MOD-1/services'
      );
      expect(reponse.status).to.be(403);
    });

    it("jette une 403 si l'utilisateur ne peut pas modifier tous les services passés en paramètres", async () => {
      testeur.depotDonnees().supprimeDesMesuresAssocieesAuModele = async () => {
        throw new ErreurDroitsInsuffisantsPourModelesDeMesureSpecifique(
          'U1',
          ['S1'],
          {}
        );
      };
      const reponse = await testeur.delete(
        '/api/modeles/mesureSpecifique/MOD-1/services'
      );
      expect(reponse.status).to.be(403);
    });

    it("jette une 400 si l'un des services passés en paramètres n'existe pas", async () => {
      testeur.depotDonnees().supprimeDesMesuresAssocieesAuModele = async () => {
        throw new ErreurServiceInexistant();
      };
      const reponse = await testeur.delete(
        '/api/modeles/mesureSpecifique/MOD-1/services'
      );
      expect(reponse.status).to.be(400);
    });
  });
});
