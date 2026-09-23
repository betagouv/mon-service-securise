import type { OpenAPIObject } from 'openapi3-ts/oas31';
import { documentOpenApi } from '../../../src/apiPublique/schemas/openApi.schema.js';
import { construisModeleDocumentation } from '../../../src/apiPublique/documentation/modeleDocumentation.js';

describe('Le modèle de documentation', () => {
  const unDocument = (
    surcharge: Partial<OpenAPIObject> = {}
  ): OpenAPIObject => ({
    openapi: '3.1.0',
    info: { title: 'Une API', version: '2.0.0' },
    paths: {},
    ...surcharge,
  });

  const operationDuDocumentOpenApi = (chemin: string) =>
    construisModeleDocumentation(documentOpenApi())
      .groupes.flatMap((groupe) => groupe.operations)
      .find((operation) => operation.chemin === chemin)!;

  describe('sur les informations générales', () => {
    it('reprend le titre, la version et la description', () => {
      const modele = construisModeleDocumentation(documentOpenApi());

      expect(modele.titre).toBe('API publique MonServiceSécurisé');
      expect(modele.version).toBe('1.0.0');
      expect(modele.description).toContain('API en lecture seule');
    });

    it('liste les serveurs', () => {
      const modele = construisModeleDocumentation(
        unDocument({ servers: [{ url: 'https://api.example.com' }] })
      );

      expect(modele.serveurs).toEqual(['https://api.example.com']);
    });

    it("décrit les mécanismes d'authentification", () => {
      const modele = construisModeleDocumentation(documentOpenApi());

      expect(modele.authentifications).toEqual([
        {
          nom: 'cleApi',
          type: 'HTTP bearer',
          description: expect.stringContaining("Clé d'API personnelle"),
        },
      ]);
    });
  });

  describe('sur les opérations', () => {
    it('les groupe par tag', () => {
      const modele = construisModeleDocumentation(
        unDocument({
          paths: {
            '/services': { get: { tags: ['Services'], responses: {} } },
            '/services/{id}': { get: { tags: ['Services'], responses: {} } },
            '/comptes': { get: { tags: ['Comptes'], responses: {} } },
          },
        })
      );

      expect(
        modele.groupes.map(({ id, nom, operations }) => [
          id,
          nom,
          operations.map((operation) => operation.chemin),
        ])
      ).toEqual([
        ['groupe-services', 'Services', ['/services', '/services/{id}']],
        ['groupe-comptes', 'Comptes', ['/comptes']],
      ]);
    });

    it("décrit l'opération", () => {
      const operation = operationDuDocumentOpenApi('/v1/services');

      expect(operation.id).toBe('operation-get-v1-services');
      expect(operation.methode).toBe('GET');
      expect(operation.chemin).toBe('/v1/services');
      expect(operation.resume).toBe('Liste des services');
      expect(operation.description).toContain('Les services numériques');
    });

    it('range les opérations sans tag dans le groupe « Autres »', () => {
      const modele = construisModeleDocumentation(
        unDocument({ paths: { '/ping': { get: { responses: {} } } } })
      );

      expect(modele.groupes[0].nom).toBe('Autres');
      expect(modele.groupes[0].operations[0].resume).toBe('GET /ping');
    });

    it('décrit les paramètres, ceux du chemin puis ceux de l’opération', () => {
      const modele = construisModeleDocumentation(
        unDocument({
          paths: {
            '/services/{id}': {
              parameters: [
                {
                  name: 'id',
                  in: 'path',
                  required: true,
                  description: 'Identifiant.',
                  schema: { type: 'string', format: 'uuid' },
                },
              ],
              get: {
                parameters: [
                  {
                    name: 'detail',
                    in: 'query',
                    schema: { type: 'boolean' },
                  },
                ],
                responses: {},
              },
            },
          },
        })
      );

      const [operation] = modele.groupes[0].operations;
      expect(operation.parametres).toEqual([
        {
          nom: 'id',
          emplacement: 'path',
          type: 'string (uuid)',
          requis: 'Oui',
          description: 'Identifiant.',
        },
        {
          nom: 'detail',
          emplacement: 'query',
          type: 'boolean',
          requis: 'Non',
          description: '',
        },
      ]);
    });
  });

  describe('sur les réponses', () => {
    const reponsesDeListeDesServices = () =>
      operationDuDocumentOpenApi('/v1/services').reponses;

    it('liste chaque statut avec sa description', () => {
      const reponses = reponsesDeListeDesServices();

      expect(reponses.map((r) => r.statut)).toEqual([
        '200',
        '401',
        '429',
        '500',
      ]);
      expect(reponses[1].description).toBe(
        "Clé d'API absente, inconnue ou révoquée."
      );
    });

    it('aplatit le corps de la réponse, en résolvant les références et les tableaux', () => {
      const [reponse200] = reponsesDeListeDesServices();

      expect(reponse200.lignes.map((l) => l.nom)).toEqual([
        'donnees',
        'donnees[].id',
        'donnees[].nom',
        'donnees[].organisationResponsable',
        'donnees[].organisationResponsable.nom',
        'donnees[].organisationResponsable.siret',
        'donnees[].nombreContributeurs',
        'donnees[].besoinsSecurite',
      ]);
    });

    it('rend les types lisibles', () => {
      const [reponse200] = reponsesDeListeDesServices();
      const typeDe = (nom: string) =>
        reponse200.lignes.find((l) => l.nom === nom)?.type;

      expect(typeDe('donnees')).toBe('Service[]');
      expect(typeDe('donnees[].id')).toBe('string (uuid)');
      expect(typeDe('donnees[].organisationResponsable')).toBe('object');
      expect(typeDe('donnees[].organisationResponsable.nom')).toBe(
        'string | null'
      );
      expect(typeDe('donnees[].nombreContributeurs')).toBe('integer');
      expect(typeDe('donnees[].besoinsSecurite')).toBe(
        '"basiques" | "moderes" | "avances"'
      );
    });

    it('indique si le champ est requis et complète la description avec les contraintes', () => {
      const [reponse200] = reponsesDeListeDesServices();
      const ligne = (nom: string) =>
        reponse200.lignes.find((l) => l.nom === nom);

      expect(ligne('donnees[].nombreContributeurs')).toMatchObject({
        requis: 'Oui',
        description: 'Nombre de personnes ayant accès au service. · ≥ 0',
      });
      expect(ligne('donnees[].besoinsSecurite')?.requis).toBe('Non');
    });

    it('construit un exemple JSON à partir des exemples et des types', () => {
      const [reponse200] = reponsesDeListeDesServices();

      expect(JSON.parse(reponse200.exemple!)).toEqual({
        donnees: [
          {
            id: '3fa85f64-5717-4562-b3fc-2c963f66afa6',
            nom: "Téléservice de demande d'aide",
            organisationResponsable: { nom: 'ANSSI', siret: '21690123400015' },
            nombreContributeurs: 4,
            besoinsSecurite: 'basiques',
          },
        ],
      });
    });

    it("n'a ni lignes ni exemple sans corps de réponse", () => {
      const modele = construisModeleDocumentation(
        unDocument({
          paths: {
            '/ping': { get: { responses: { 204: { description: 'OK' } } } },
          },
        })
      );

      const [reponse] = modele.groupes[0].operations[0].reponses;
      expect(reponse.lignes).toEqual([]);
      expect(reponse.exemple).toBeUndefined();
    });
  });

  describe('sur les schémas', () => {
    it('décrit chaque schéma nommé du document', () => {
      const modele = construisModeleDocumentation(
        unDocument({
          components: {
            schemas: {
              ReponseServices: { type: 'object' },
              Erreur: { type: 'object' },
            },
          },
        })
      );

      expect(modele.schemas.map((s) => [s.id, s.nom])).toEqual([
        ['schema-reponseservices', 'ReponseServices'],
        ['schema-erreur', 'Erreur'],
      ]);
    });

    it("décrit les champs d'un schéma et en donne un exemple", () => {
      const modele = construisModeleDocumentation(documentOpenApi());

      const erreur = modele.schemas.find((s) => s.nom === 'Erreur')!;
      expect(erreur.lignes).toEqual([
        {
          nom: 'erreur',
          type: 'string',
          requis: 'Oui',
          description: "Code de l'erreur, stable et destiné aux programmes.",
        },
      ]);
      expect(JSON.parse(erreur.exemple!)).toEqual({
        erreur: 'CLE_API_INVALIDE',
      });
    });

    it('ne boucle pas sur une référence circulaire', () => {
      const modele = construisModeleDocumentation(
        unDocument({
          components: {
            schemas: {
              Noeud: {
                type: 'object',
                properties: {
                  enfants: {
                    type: 'array',
                    items: { $ref: '#/components/schemas/Noeud' },
                  },
                },
              },
            },
          },
        })
      );

      const [noeud] = modele.schemas;
      expect(noeud.lignes.map((l) => l.nom)).toEqual(['enfants']);
      expect(JSON.parse(noeud.exemple!)).toEqual({ enfants: [{}] });
    });
  });
});
