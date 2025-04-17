const expect = require('expect.js');
const {
  serviceApresAuthentification,
} = require('../../src/utilisateur/serviceApresAuthentification');
const { unUtilisateur } = require('../constructeurs/constructeurUtilisateur');
const Utilisateur = require('../../src/modeles/utilisateur');

describe("Le service d'après authentification", () => {
  let adaptateurProfilAnssi;
  let serviceAnnuaire;
  let profilProConnect;
  let depotDonnees;
  let parametresParDefaut;

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
    depotDonnees = {
      utilisateurAvecEmail: async (_) => undefined,
      utilisateur: async () => undefined,
      metsAJourUtilisateur: async () => undefined,
      rafraichisProfilUtilisateurLocal: async () => {},
    };
    parametresParDefaut = {
      adaptateurProfilAnssi,
      serviceAnnuaire,
      profilProConnect: profilProConnect.complet(),
      depotDonnees,
    };
  });

  describe("lorsque MSS ne connaît pas l'utilisateur", () => {
    it('redirige vers la page de création de compte', async () => {
      const resultat = await serviceApresAuthentification(parametresParDefaut);

      expect(resultat.type).to.be('redirection');
      expect(resultat.cible).to.be('/creation-compte');
    });

    it('ne le connecte pas', async () => {
      const resultat = await serviceApresAuthentification(parametresParDefaut);

      expect(resultat.utilisateurAConnecter).to.be(undefined);
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
          const resultat =
            await serviceApresAuthentification(parametresParDefaut);

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

          const resultat =
            await serviceApresAuthentification(parametresParDefaut);

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
            ...parametresParDefaut,
            profilProConnect: profilProConnect.sansSiret(),
          });

          expect(resultat.donnees.organisation).to.be(undefined);
        });

        it("reste robuste si l'entreprise n'est pas trouvée", async () => {
          const resultat = await serviceApresAuthentification({
            ...parametresParDefaut,
            serviceAnnuaire: {
              rechercheOrganisations: async () => [],
            },
          });

          expect(resultat.donnees.organisation).to.be(undefined);
          expect(Object.keys(resultat.donnees)).to.not.contain('organisation');
        });
      });
    });
  });

  describe("lorsque MSS connaît l'utilisateur", () => {
    beforeEach(() => {
      depotDonnees.utilisateurAvecEmail = async (email) =>
        email === 'jean.dujardin@beta.gouv.fr'
          ? unUtilisateur().avecEmail(email).construis()
          : undefined;
      depotDonnees.utilisateur = async () => unUtilisateur().construis();
    });

    it('le connecte', async () => {
      const resultat = await serviceApresAuthentification(parametresParDefaut);

      expect(resultat.utilisateurAConnecter).to.be.an(Utilisateur);
      expect(resultat.utilisateurAConnecter.email).to.be(
        'jean.dujardin@beta.gouv.fr'
      );
    });

    describe("s'il est invité", () => {
      beforeEach(() => {
        depotDonnees.utilisateurAvecEmail = async (email) =>
          unUtilisateur().avecEmail(email).quiAEteInvite().construis();
      });

      it('redirige vers la page après authentification', async () => {
        const resultat =
          await serviceApresAuthentification(parametresParDefaut);

        expect(resultat.type).to.be('rendu');
        expect(resultat.cible).to.be('apresAuthentification');
      });

      it('enrichit les données avec la propriété `invite`', async () => {
        const resultat =
          await serviceApresAuthentification(parametresParDefaut);

        expect(resultat.donnees.invite).to.be(true);
      });

      it('ne rafraîchit pas son profil utilisateur local', async () => {
        let utilisateurRafraichisAppele = false;
        depotDonnees.rafraichisProfilUtilisateurLocal = (_) => {
          utilisateurRafraichisAppele = true;
        };

        await serviceApresAuthentification(parametresParDefaut);

        expect(utilisateurRafraichisAppele).to.be(false);
      });
    });

    describe("s'il n'est pas invité", () => {
      beforeEach(() => {
        depotDonnees.utilisateurAvecEmail = async (email) =>
          unUtilisateur()
            .avecId('U1')
            .avecEmail(email)
            .quiEstComplet()
            .construis();
      });

      it('rafraîchis son profil utilisateur local', async () => {
        let idUtilisateurRafraichis;
        depotDonnees.rafraichisProfilUtilisateurLocal = (id) => {
          idUtilisateurRafraichis = id;
        };

        await serviceApresAuthentification(parametresParDefaut);

        expect(idUtilisateurRafraichis).to.be('U1');
      });

      it('rend la page `après-authentification`', async () => {
        const resultat =
          await serviceApresAuthentification(parametresParDefaut);

        expect(resultat.type).to.be('rendu');
        expect(resultat.cible).to.be('apresAuthentification');
      });

      it('ne contient pas de données utilisateur', async () => {
        const resultat =
          await serviceApresAuthentification(parametresParDefaut);

        expect(resultat.donnees).to.be(undefined);
      });

      describe('si son profil MSS est complet après rafraîchissement', () => {
        beforeEach(() => {
          depotDonnees.utilisateur = (id) =>
            unUtilisateur().avecId(id).quiEstComplet().construis();
        });

        it('ne mets pas à jour les informations', async () => {
          let miseAJourAppelee = false;
          depotDonnees.metsAJourUtilisateur = () => {
            miseAJourAppelee = true;
          };

          await serviceApresAuthentification(parametresParDefaut);

          expect(miseAJourAppelee).to.be(false);
        });
      });

      describe('si son profil MSS est incomplet', () => {
        beforeEach(() => {
          depotDonnees.utilisateur = async (id) =>
            unUtilisateur()
              .avecId(id)
              .quiNAPasRempliSonProfil()
              .quiAccepteCGU()
              .construis();
        });

        it('complète le profil avec les données de ProConnect', async () => {
          let donneesRecues;
          depotDonnees.metsAJourUtilisateur = (id, donnees) => {
            if (id === 'U1') {
              donneesRecues = donnees;
            }
          };

          await serviceApresAuthentification({
            ...parametresParDefaut,
            profilProConnect: {
              nom: 'Nom PC',
              prenom: 'Prenom PC',
              email: 'Email PC',
              siret: 'Siret PC',
            },
          });
          expect(donneesRecues).to.eql({
            nom: 'Nom PC',
            prenom: 'Prenom PC',
            entite: { siret: 'Siret PC' },
          });
        });
      });
    });
  });
});
