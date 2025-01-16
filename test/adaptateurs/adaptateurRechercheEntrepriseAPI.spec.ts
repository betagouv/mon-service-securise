const expect = require('expect.js');
const {
  rechercheOrganisations,
  recupereDetailsOrganisation,
} = require('../../src/adaptateurs/adaptateurRechercheEntrepriseAPI');

describe("L'adaptateur recherche entreprise qui utilise l'API Recherche Entreprise", () => {
  describe("sur demande du nom de l'établissement ou de l'entreprise", () => {
    it('retourne les informations du siège si la recherche est textuelle', async () => {
      const reponseAPI = {
        nom_complet: 'NOM SIEGE',
        siege: {
          departement: 'DEPARTEMENT SIEGE',
          siret: 'SIRET SIEGE',
        },
        matching_etablissements: [
          {
            siret: 'SIRET ETABLISSEMENT',
          },
        ],
      };
      const fauxAxios = {
        get: async () => ({ data: { results: [reponseAPI] } }),
      };

      const resultat = await rechercheOrganisations(
        'un texte',
        '75',
        fauxAxios
      );

      expect(resultat[0].nom).to.eql('NOM SIEGE');
      expect(resultat[0].siret).to.eql('SIRET SIEGE');
      expect(resultat[0].departement).to.eql('DEPARTEMENT SIEGE');
    });

    it('retourne les informations du siège si la recherche est textuelle avec des chiffres au début', async () => {
      const reponseAPI = {
        nom_complet: 'NOM SIEGE',
        siege: {
          departement: 'DEPARTEMENT SIEGE',
          siret: 'SIRET SIEGE',
        },
        matching_etablissements: [
          {
            siret: 'SIRET ETABLISSEMENT',
          },
        ],
      };
      const fauxAxios = {
        get: async () => ({ data: { results: [reponseAPI] } }),
      };

      const resultat = await rechercheOrganisations(
        '12345 un texte',
        '75',
        fauxAxios
      );

      expect(resultat[0].nom).to.eql('NOM SIEGE');
      expect(resultat[0].siret).to.eql('SIRET SIEGE');
      expect(resultat[0].departement).to.eql('DEPARTEMENT SIEGE');
    });

    describe('si on recherche par siret', () => {
      it("retourne le nom de l'enseigne et les infos de l'établissement non siège si l'enseigne est renseignée", async () => {
        const reponseAPI = {
          nom_complet: 'NOM SIEGE',
          siege: {
            departement: 'DEPARTEMENT SIEGE',
            siret: 'SIRET SIEGE',
          },
          matching_etablissements: [
            {
              commune: '75107',
              siret: 'SIRET ETABLISSEMENT',
              liste_enseignes: ['ENSEIGNE'],
            },
          ],
        };
        const fauxAxios = {
          get: async () => ({ data: { results: [reponseAPI] } }),
        };

        const resultat = await rechercheOrganisations(
          '13000766900019',
          '75',
          fauxAxios
        );

        expect(resultat[0].nom).to.eql('ENSEIGNE');
        expect(resultat[0].siret).to.eql('SIRET ETABLISSEMENT');
        expect(resultat[0].departement).to.eql('75');
      });

      it("parvient à extraire le département dans le cas d'un DROM COM", async () => {
        const reponseAPI = {
          nom_complet: 'NOM SIEGE',
          siege: {
            departement: 'DEPARTEMENT SIEGE',
            siret: 'SIRET SIEGE',
          },
          matching_etablissements: [
            {
              commune: '97121',
              siret: 'SIRET ETABLISSEMENT',
              liste_enseignes: ['ENSEIGNE'],
            },
          ],
        };
        const fauxAxios = {
          get: async () => ({ data: { results: [reponseAPI] } }),
        };

        const resultat = await rechercheOrganisations(
          '13000766900019',
          '75',
          fauxAxios
        );

        expect(resultat[0].nom).to.eql('ENSEIGNE');
        expect(resultat[0].siret).to.eql('SIRET ETABLISSEMENT');
        expect(resultat[0].departement).to.eql('971');
      });

      it("retourne le nom de l'entreprise si aucune enseigne n'est renseignée", async () => {
        const reponseAPI = {
          nom_complet: 'NOM SIEGE',
          siege: {
            departement: 'DEPARTEMENT SIEGE',
            siret: 'SIRET SIEGE',
          },
          matching_etablissements: [
            {
              commune: '75107',
              siret: 'SIRET ETABLISSEMENT',
              liste_enseignes: null,
            },
          ],
        };
        const fauxAxios = {
          get: async () => ({ data: { results: [reponseAPI] } }),
        };

        const resultat = await rechercheOrganisations(
          '13000766900019',
          '75',
          fauxAxios
        );

        expect(resultat[0].nom).to.eql('NOM SIEGE');
        expect(resultat[0].siret).to.eql('SIRET ETABLISSEMENT');
        expect(resultat[0].departement).to.eql('75');
      });

      it("parvient à extraire le siret dans le cas d'une recherche avec espace", async () => {
        const reponseAPI = {
          nom_complet: 'NOM SIEGE',
          siege: {
            departement: 'DEPARTEMENT SIEGE',
            siret: 'SIRET SIEGE',
          },
          matching_etablissements: [
            {
              commune: '75107',
              siret: 'SIRET ETABLISSEMENT',
              liste_enseignes: null,
            },
          ],
        };
        const fauxAxios = {
          get: async () => ({ data: { results: [reponseAPI] } }),
        };

        const resultat = await rechercheOrganisations(
          '1300 07669 00019',
          '75',
          fauxAxios
        );

        expect(resultat[0].nom).to.eql('NOM SIEGE');
        expect(resultat[0].siret).to.eql('SIRET ETABLISSEMENT');
        expect(resultat[0].departement).to.eql('75');
      });
    });

    it("retourne les informations du siège s'il n'y a pas de matching établissement", async () => {
      const reponseAPI = {
        nom_complet: 'NOM SIEGE',
        siege: {
          departement: 'DEPARTEMENT SIEGE',
          siret: 'SIRET SIEGE',
        },
        matching_etablissements: [],
      };
      const fauxAxios = {
        get: async () => ({ data: { results: [reponseAPI] } }),
      };

      const resultat = await rechercheOrganisations(
        '1300 07669 00019',
        '75',
        fauxAxios
      );

      expect(resultat[0].nom).to.eql('NOM SIEGE');
      expect(resultat[0].siret).to.eql('SIRET SIEGE');
      expect(resultat[0].departement).to.eql('DEPARTEMENT SIEGE');
    });
  });

  describe("sur demande de détails d'une organisation", () => {
    it("utilise les données pertinentes de l'enseigne", async () => {
      const reponseAPI = {
        activite_principale: 'ACTIVITE SIEGE',
        annee_tranche_effectif_salarie: 'ANNEE TRANCHE SIEGE',
        tranche_effectif_salarie: 'TRANCHE SIEGE',
        complements: {},
        siege: {
          commune: 'COMMUNE SIEGE',
          departement: 'DEPARTEMENT SIEGE',
        },
        matching_etablissements: [
          {
            activite_principale: 'ACTIVITE ENSEIGNE',
            annee_tranche_effectif_salarie: 'ANNEE TRANCHE ENSEIGNE',
            tranche_effectif_salarie: 'TRANCHE ENSEIGNE',
            commune: '75000',
          },
        ],
      };
      const fauxAxios = {
        get: async () => ({ data: { results: [reponseAPI] } }),
      };

      const resultat = await recupereDetailsOrganisation(
        '123456789',
        fauxAxios
      );

      expect(resultat.activitePrincipale).to.eql('ACTIVITE ENSEIGNE');
      expect(resultat.trancheEffectifSalarie).to.eql('TRANCHE ENSEIGNE');
      expect(resultat.anneeTrancheEffectifSalarie).to.eql(
        'ANNEE TRANCHE ENSEIGNE'
      );
      expect(resultat.commune).to.eql('75000');
      expect(resultat.departement).to.eql('75');
    });
  });
});
