import { AdaptateurProfilAnssi } from '@lab-anssi/lib';
import {
  ProfilProConnect,
  serviceApresAuthentification,
} from '../../src/utilisateur/serviceApresAuthentification.js';
import { unUtilisateur } from '../constructeurs/constructeurUtilisateur.js';
import Utilisateur from '../../src/modeles/utilisateur.js';
import { ServiceAnnuaire } from '../../src/annuaire/serviceAnnuaire.interface.ts';
import { DepotDonnees } from '../../src/depotDonnees.interface.ts';
import { UUID } from '../../src/typesBasiques.ts';
import { creeDepot } from '../../src/depotDonnees.js';
import { unePersistanceMemoire } from '../constructeurs/constructeurAdaptateurPersistanceMemoire.js';
import fauxAdaptateurRechercheEntreprise from '../mocks/adaptateurRechercheEntreprise.js';
import { fabriqueBusPourLesTests } from '../bus/aides/busPourLesTests.js';
import fauxAdaptateurChiffrement from '../mocks/adaptateurChiffrement.js';

describe("Le service d'après authentification", () => {
  let adaptateurProfilAnssi: AdaptateurProfilAnssi;
  let serviceAnnuaire: ServiceAnnuaire;
  let profilProConnect: {
    complet: () => ProfilProConnect;
    sansSiret: () => ProfilProConnect;
  };
  let depotDonnees: DepotDonnees;
  let parametresParDefaut: {
    adaptateurProfilAnssi: AdaptateurProfilAnssi;
    serviceAnnuaire: ServiceAnnuaire;
    profilProConnect: ProfilProConnect;
    depotDonnees: DepotDonnees;
  };

  beforeEach(() => {
    adaptateurProfilAnssi = {
      recupere: async () => undefined,
      metsAJour: async () => {},
    } as unknown as AdaptateurProfilAnssi;

    serviceAnnuaire = {
      rechercheOrganisations: async () => [],
    } as unknown as ServiceAnnuaire;

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
      utilisateurAvecEmail: async () => undefined,
      utilisateur: async () => undefined,
      metsAJourUtilisateur: async () => undefined,
      rafraichisProfilUtilisateurLocal: async () => {},
    } as unknown as DepotDonnees;

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

      expect(resultat.type).toBe('redirection');
      expect(resultat.cible).toBe('/creation-compte');
    });

    it('ne le connecte pas', async () => {
      const resultat = await serviceApresAuthentification(parametresParDefaut);

      expect(resultat).not.toHaveProperty('utilisateurAConnecter');
    });

    describe('concernant les données utilisateur', () => {
      describe("si l'utilisateur est connu dans MPA", () => {
        it('renvoie les données de MPA', async () => {
          adaptateurProfilAnssi.recupere = async (email) =>
            email === 'jean.dujardin@beta.gouv.fr'
              ? {
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
                }
              : undefined;
          const resultat =
            await serviceApresAuthentification(parametresParDefaut);

          expect(resultat.donnees).toEqual({
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
              ? [{ nom: 'MonOrganisation', departement: '75', siret }]
              : [];

          const resultat =
            await serviceApresAuthentification(parametresParDefaut);

          expect(resultat.donnees).toEqual({
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

          expect(resultat.donnees!.organisation).toBe(undefined);
        });

        it("reste robuste si l'entreprise n'est pas trouvée", async () => {
          const resultat = await serviceApresAuthentification({
            ...parametresParDefaut,
            serviceAnnuaire: {
              rechercheOrganisations: async () => [],
            } as unknown as ServiceAnnuaire,
          });

          expect(resultat.donnees!.organisation).toBe(undefined);
          expect(Object.keys(resultat.donnees!)).not.toContain('organisation');
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

      if (resultat.type !== 'rendu')
        expect.fail(
          `Le type d'ordre devrai être un rendu, reçu : ${resultat.type}`
        );

      expect(resultat.utilisateurAConnecter).toBeInstanceOf(Utilisateur);
      expect(resultat.utilisateurAConnecter!.email).toBe(
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

        expect(resultat.type).toBe('rendu');
        expect(resultat.cible).toBe('apresAuthentification');
      });

      it('enrichit les données avec la propriété `invite`', async () => {
        const resultat =
          await serviceApresAuthentification(parametresParDefaut);

        // @ts-expect-error On sait que la propriété est présente
        expect(resultat.donnees!.invite).toBe(true);
      });

      it('ne rafraîchit pas son profil utilisateur local', async () => {
        let utilisateurRafraichisAppele = false;
        depotDonnees.rafraichisProfilUtilisateurLocal = async () => {
          utilisateurRafraichisAppele = true;
        };

        await serviceApresAuthentification(parametresParDefaut);

        expect(utilisateurRafraichisAppele).toBe(false);
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

      it('synchronise les informations utilisateurs : ProCo > MPA > Local. Les infos ProCo font autorité sur nom & prénom.', async () => {
        let donneesMpa: Record<string, unknown>;
        const mpaDuTest = {
          metsAJour: async (donnees: Record<string, unknown>) => {
            donneesMpa = donnees;
          },
          recupere: async () => ({
            ...donneesMpa,
            telephone: '06…',
            domainesSpecialite: ['RSSI'],
            organisation: {
              nom: 'Orga MPA du test',
              departement: '33',
              siret: 12345678901234,
            },
          }),
        } as unknown as AdaptateurProfilAnssi;

        const depotDuTest = creeDepot({
          adaptateurChiffrement: fauxAdaptateurChiffrement(),
          adaptateurPersistance: unePersistanceMemoire().construis(),
          adaptateurRechercheEntite: fauxAdaptateurRechercheEntreprise(),
          adaptateurProfilAnssi: mpaDuTest,
          busEvenements: fabriqueBusPourLesTests(),
        });
        await depotDuTest.nouvelUtilisateur(
          unUtilisateur()
            .avecEmail('jean.dujardin@beta.gouv.fr')
            .quiSAppelle('Prénom-MSS Nom-MSS').donnees
        );

        await serviceApresAuthentification({
          ...parametresParDefaut,
          adaptateurProfilAnssi: mpaDuTest,
          depotDonnees: depotDuTest,
          profilProConnect: {
            nom: 'Nom ProConnect',
            prenom: 'Prénom ProConnect',
            email: 'jean.dujardin@beta.gouv.fr',
          },
        });

        const [apres] = await depotDuTest.tousUtilisateurs();
        expect(apres.nom).toBe('Nom ProConnect');
        expect(apres.prenom).toBe('Prénom ProConnect');
        expect(apres.telephone).toBe('06…');
        expect(apres.postes).toEqual(['RSSI']);
        expect(apres.entite.toJSON()).toEqual({
          departement: '33',
          nom: 'Orga MPA du test',
          siret: 12345678901234,
        });
      });

      it('rafraîchis son profil utilisateur local', async () => {
        let idUtilisateurRafraichis;
        depotDonnees.rafraichisProfilUtilisateurLocal = async (id: UUID) => {
          idUtilisateurRafraichis = id;
        };

        await serviceApresAuthentification(parametresParDefaut);

        expect(idUtilisateurRafraichis).toBe('U1');
      });

      it('rend la page `après-authentification`', async () => {
        const resultat =
          await serviceApresAuthentification(parametresParDefaut);

        expect(resultat.type).toBe('rendu');
        expect(resultat.cible).toBe('apresAuthentification');
      });

      it('ne contient pas de données utilisateur', async () => {
        const resultat =
          await serviceApresAuthentification(parametresParDefaut);

        expect(resultat.donnees).toBe(undefined);
      });

      describe('si son profil MSS est complet après rafraîchissement', () => {
        beforeEach(() => {
          depotDonnees.utilisateur = async (id: UUID) =>
            unUtilisateur().avecId(id).quiEstComplet().construis();
        });

        it('ne mets pas à jour les informations', async () => {
          let miseAJourAppelee = false;
          depotDonnees.metsAJourUtilisateur = async () => {
            miseAJourAppelee = true;
            return undefined;
          };

          await serviceApresAuthentification(parametresParDefaut);

          expect(miseAJourAppelee).toBe(false);
        });
      });
    });
  });
});
