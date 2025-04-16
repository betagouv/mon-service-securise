const expect = require('expect.js');
const {
  serviceApresAuthentification,
} = require('../../src/utilisateur/serviceApresAuthentification');

describe("Le service d'après authentification", () => {
  let adaptateurProfilAnssi;
  let serviceAnnuaire;
  let profilProConnect;

  beforeEach(() => {
    adaptateurProfilAnssi = {
      recupere: async () => undefined,
    };
    serviceAnnuaire = {
      rechercheOrganisations: async () => [],
    };
    profilProConnect = {
      complet: () => ({
        email: 'jean.dujardin@beta.gouv.fr',
        nom: 'Dujardin',
        prenom: 'Jean',
        siret: '1234',
      }),
      sansSiret: () => ({
        ...profilProConnect.complet(),
        siret: undefined,
      }),
    };
  });

  describe("lorsque MSS ne connaît pas l'utilisateur", () => {
    it('redirige vers la page de création de compte', async () => {
      const resultat = await serviceApresAuthentification({
        adaptateurProfilAnssi,
        serviceAnnuaire,
        profilProConnect: {
          siret: undefined,
        },
      });

      expect(resultat.type).to.be('redirection');
      expect(resultat.cible).to.be('/creation-compte');
    });

    describe('concernant les données utilisateur', () => {
      describe("si l'utilisateur est connu dans MPA", () => {
        it('renvoie les données de MPA', async () => {
          adaptateurProfilAnssi.recupere = async () => ({
            email: 'jean.dujardin@beta.gouv.fr',
            nom: 'Dujardin',
            prenom: 'Jean',
            telephone: '0102030405',
            organisation: {
              nom: 'MonOrganisation',
              departement: '75',
              siret: '1234',
            },
            domainesSpecialite: ['RSSI'],
          });
          const resultat = await serviceApresAuthentification({
            adaptateurProfilAnssi,
          });

          expect(resultat.donnees).to.eql({
            email: 'jean.dujardin@beta.gouv.fr',
            nom: 'Dujardin',
            prenom: 'Jean',
            telephone: '0102030405',
            organisation: {
              nom: 'MonOrganisation',
              departement: '75',
              siret: '1234',
            },
            domainesSpecialite: ['RSSI'],
          });
        });
      });

      describe("si l'utilisateur est inconnu dans MPA", () => {
        it("renvoie les données de ProConnect complétées par l'annuaire recherche entreprise", async () => {
          serviceAnnuaire.rechercheOrganisations = async (siret) =>
            siret === '1234'
              ? [{ nom: 'MonOrganisation', departement: '75' }]
              : [];

          const resultat = await serviceApresAuthentification({
            adaptateurProfilAnssi,
            serviceAnnuaire,
            profilProConnect: profilProConnect.complet(),
          });

          expect(resultat.donnees).to.eql({
            email: 'jean.dujardin@beta.gouv.fr',
            nom: 'Dujardin',
            prenom: 'Jean',
            organisation: {
              nom: 'MonOrganisation',
              departement: '75',
              siret: '1234',
            },
          });
        });

        it("reste robuste si le siret n'est pas dans ProConnect", async () => {
          const resultat = await serviceApresAuthentification({
            adaptateurProfilAnssi,
            serviceAnnuaire,
            profilProConnect: profilProConnect.sansSiret(),
          });

          expect(resultat.donnees.organisation).to.be(undefined);
        });

        it("reste robuste si l'entreprise n'est pas trouvée", async () => {
          const resultat = await serviceApresAuthentification({
            adaptateurProfilAnssi,
            serviceAnnuaire: {
              rechercheOrganisations: async () => [],
            },
            profilProConnect: profilProConnect.complet(),
          });

          expect(resultat.donnees.organisation).to.be(undefined);
        });
      });
    });
  });

  describe("lorsque MSS connaît l'utilisateur", () => {});
});
