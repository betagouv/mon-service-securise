import { beforeEach } from 'vitest';
import { creeReferentielV2 } from '../../../src/referentielV2.js';
import { ReferentielV2 } from '../../../src/referentiel.interface.js';
import TeleversementServicesV2, {
  DepotPourTeleversementServices,
} from '../../../src/modeles/televersement/televersementServicesV2.js';
import { LigneServiceTeleverseV2 } from '../../../src/modeles/televersement/serviceTeleverseV2.js';
import Dossier from '../../../src/modeles/dossier.js';
import { fabriqueBusPourLesTests } from '../../bus/aides/busPourLesTests.js';
import BusEvenements from '../../../src/bus/busEvenements.js';
import { unUUID } from '../../constructeurs/UUID.js';
import EvenementDossierHomologationImporte from '../../../src/bus/evenementDossierHomologationImporte.js';
import EvenementServicesImportes from '../../../src/bus/evenementServicesImportes.js';

describe('Un téléversement de services V2', () => {
  let referentiel: ReferentielV2;

  beforeEach(() => {
    referentiel = creeReferentielV2();
  });

  const ligneTeleverseeValide: LigneServiceTeleverseV2 = {
    audienceCible: 'Large',
    dureeDysfonctionnementAcceptable: 'Moins de 4h',
    localisationDonneesTraitees: "Au sein de l'Union européenne",
    nom: 'Un service v2',
    ouvertureSysteme: 'Accessible depuis internet',
    siret: '12345678912345',
    statutDeploiement: 'En conception',
    typeHebergement: 'Autre',
    typeService: ['API'],
    volumetrieDonneesTraitees: 'Elevé',
    dateHomologation: new Date('2025-01-22'),
    dureeHomologation: '6 mois',
    nomAutoriteHomologation: 'Nom Prénom',
    fonctionAutoriteHomologation: 'Fonction',
  };

  describe('sur demande de validation', () => {
    it('aggrège les erreurs de chaque service téléversé', () => {
      const t = new TeleversementServicesV2(
        {
          services: [
            { ...ligneTeleverseeValide, siret: 'pasUnSiret' },
            {
              ...ligneTeleverseeValide,
              typeService: [],
              nom: 'Un service v2 bis',
            },
            {
              ...ligneTeleverseeValide,
              nom: 'Un service v2 trois',
              fonctionAutoriteHomologation: undefined,
            },
          ],
        },
        referentiel
      );

      const erreurs = t.valide();

      expect(erreurs).toEqual([
        ['SIRET_INVALIDE'],
        ['TYPE_INVALIDE'],
        ['DOSSIER_HOMOLOGATION_INCOMPLET'],
      ]);
    });

    it('ajoute le nom de chaque service téléversé à la liste de noms existants', () => {
      const t = new TeleversementServicesV2(
        {
          services: [
            { ...ligneTeleverseeValide, nom: 'Service A' },
            { ...ligneTeleverseeValide, nom: 'Service B' },
            { ...ligneTeleverseeValide, nom: 'Service B' },
          ],
        },
        referentiel
      );

      const nomServicesExistants = ['Service A'];
      const erreurs = t.valide(nomServicesExistants);

      expect(erreurs.length).toBe(3);
      expect(erreurs[0][0]).toBe('NOM_EXISTANT');
      expect(erreurs[1].length).toBe(0);
      expect(erreurs[2][0]).toBe('NOM_EXISTANT');
    });
  });

  describe('sur demande de rapport détaillé', () => {
    it("renvoie les services avec leur rapport d'erreur", () => {
      const serviceA = { ...ligneTeleverseeValide, nom: 'Service A' };
      const serviceB = {
        ...ligneTeleverseeValide,
        nom: 'Service B',
        siret: 'pasUnSiret',
      };
      const t = new TeleversementServicesV2(
        { services: [serviceA, serviceB] },
        referentiel
      );

      const rapport = t.rapportDetaille();

      const [a, b] = rapport.services;
      expect(a.service).toEqual(serviceA);
      expect(a.erreurs).toEqual([]);
      expect(b.service).toEqual(serviceB);
      expect(b.erreurs).toEqual(['SIRET_INVALIDE']);
    });

    it('ajoute un numéro de ligne à chaque élément, en démarrant à 1', () => {
      const serviceA = { ...ligneTeleverseeValide, nom: 'A' };
      const serviceB = { ...ligneTeleverseeValide, nom: 'B' };
      const t = new TeleversementServicesV2(
        { services: [serviceA, serviceB] },
        referentiel
      );

      const rapport = t.rapportDetaille();

      const [a, b] = rapport.services;
      expect(a.numeroLigne).toBe(1);
      expect(a.service.nom).toBe('A');
      expect(b.numeroLigne).toBe(2);
      expect(b.service.nom).toBe('B');
    });

    describe('concernant le statut renvoyé', () => {
      it('renvoie un statut "Invalide" si des erreurs sont présentes', () => {
        const t = new TeleversementServicesV2(
          { services: [{ ...ligneTeleverseeValide, siret: 'pasUnSiret' }] },
          referentiel
        );

        const rapport = t.rapportDetaille();

        expect(rapport.statut).toBe('INVALIDE');
      });

      it("renvoie un statut 'Invalide' si aucun service n'est présent", () => {
        const t = new TeleversementServicesV2({ services: [] }, referentiel);

        const rapport = t.rapportDetaille();

        expect(rapport.statut).toBe('INVALIDE');
      });

      it('renvoie un statut "Valide" si aucune erreur n\'est présente', () => {
        const t = new TeleversementServicesV2(
          {
            services: [structuredClone(ligneTeleverseeValide)],
          },
          referentiel
        );

        const rapport = t.rapportDetaille();

        expect(rapport.statut).toBe('VALIDE');
      });
    });

    describe('sur demande de création des services', () => {
      let depotDonnees: DepotPourTeleversementServices;
      let busEvenement: BusEvenements &
        ReturnType<typeof fabriqueBusPourLesTests>;

      beforeEach(() => {
        depotDonnees = {
          nouveauService: async () => unUUID('1'),
          ajouteSuggestionAction: async () => {},
          ajouteDossierCourantSiNecessaire: async () =>
            new Dossier({ id: 'D1' }),
          enregistreDossier: async () => {},
          metsAJourProgressionTeleversement: async () => {},
        };
        busEvenement = fabriqueBusPourLesTests() as BusEvenements &
          ReturnType<typeof fabriqueBusPourLesTests>;
      });

      describe('pour chaque service à créer', () => {
        let televersement: TeleversementServicesV2;

        beforeEach(() => {
          televersement = new TeleversementServicesV2(
            { services: [structuredClone(ligneTeleverseeValide)] },
            referentiel
          );
        });

        it('délègue au dépôt de données la création du service', async () => {
          let donneesRecues;
          depotDonnees.nouveauService = async (idUtilisateur, donnees) => {
            donneesRecues = { idUtilisateur, donnees };
            return unUUID('1');
          };

          await televersement.creeLesServices(
            unUUID('2'),
            depotDonnees,
            busEvenement
          );
          expect(donneesRecues!.idUtilisateur).toBe(unUUID('2'));
          expect(donneesRecues!.donnees).not.toBe(undefined);
        });

        describe("si le service a un dossier d'homologation", () => {
          it("délègue au dépôt de données la création d'un dossier", async () => {
            let idRecu;
            depotDonnees.ajouteDossierCourantSiNecessaire = async (
              idService
            ) => {
              idRecu = idService;
              return new Dossier({ id: 'D1' });
            };

            await televersement.creeLesServices(
              unUUID('2'),
              depotDonnees,
              busEvenement
            );
            expect(idRecu).toBe(unUUID('1'));
          });

          it('complète le dossier avec les données du téléversement', async () => {
            const dossierRecu = new Dossier({ id: 'D1' }, referentiel);
            depotDonnees.ajouteDossierCourantSiNecessaire = async () =>
              dossierRecu;

            await televersement.creeLesServices(
              unUUID('2'),
              depotDonnees,
              busEvenement
            );

            expect(dossierRecu.toJSON()).toEqual({
              id: 'D1',
              finalise: true,
              importe: true,
              decision: {
                dateHomologation: '22/01/2025',
                dureeValidite: 'sixMois',
              },
              autorite: {
                nom: 'Nom Prénom',
                fonction: 'Fonction',
              },
              avecAvis: false,
              avis: [],
              avecDocuments: false,
              documents: [],
              dateTelechargement: {
                date: '22/01/2025',
              },
            });
          });

          it("délègue au dépôt de données l'enregistrement du dossier finalisé", async () => {
            let donneesRecues;
            depotDonnees.enregistreDossier = async (idService, dossier) => {
              donneesRecues = { idService, dossier };
            };

            await televersement.creeLesServices(
              unUUID('2'),
              depotDonnees,
              busEvenement
            );

            expect(donneesRecues!.idService).toBe(unUUID('1'));
            expect(donneesRecues!.dossier.finalise).toBe(true);
            expect(donneesRecues!.dossier.importe).toBe(true);
          });

          it("publie un évènement d'homologation importée sur le bus", async () => {
            await televersement.creeLesServices(
              unUUID('2'),
              depotDonnees,
              busEvenement
            );

            expect(
              busEvenement.aRecuUnEvenement(EvenementDossierHomologationImporte)
            ).toBe(true);
            expect(
              busEvenement.recupereEvenement(
                EvenementDossierHomologationImporte
              ).idService
            ).toBe(unUUID('1'));
          });
        });

        it("ne créé pas de dossier si le service téléversé n'en a pas (*toutes* les colonnes pour le dossier sont vides)", async () => {
          let depotAppele = false;
          depotDonnees.ajouteDossierCourantSiNecessaire = async () => {
            depotAppele = true;
            return new Dossier({ id: 'D1' });
          };
          const ligne = structuredClone(ligneTeleverseeValide);
          delete ligne.dateHomologation;
          delete ligne.dureeHomologation;
          delete ligne.nomAutoriteHomologation;
          delete ligne.fonctionAutoriteHomologation;
          televersement = new TeleversementServicesV2(
            { services: [{ ...ligne }] },
            referentiel
          );

          await televersement.creeLesServices(
            unUUID('2'),
            depotDonnees,
            busEvenement
          );

          expect(depotAppele).toBe(false);
        });

        it("délègue au dépôt de données l'ajout d'une suggestion d'action invitant à compléter la description du service", async () => {
          let donneesRecues;
          depotDonnees.ajouteSuggestionAction = async (
            idService,
            natureSuggestion
          ) => {
            donneesRecues = { idService, natureSuggestion };
          };

          await televersement.creeLesServices(
            unUUID('2'),
            depotDonnees,
            busEvenement
          );
          expect(donneesRecues!.idService).toBe(unUUID('1'));
          expect(donneesRecues!.natureSuggestion).toBe(
            'finalisationDescriptionServiceImporte'
          );
        });

        it('publie un évènement sur le bus', async () => {
          await televersement.creeLesServices(
            unUUID('2'),
            depotDonnees,
            busEvenement
          );

          expect(busEvenement.aRecuUnEvenement(EvenementServicesImportes)).toBe(
            true
          );
          const e = busEvenement.recupereEvenement(EvenementServicesImportes);
          expect(e.nbServicesImportes).toBe(1);
          expect(e.versionServicesImportes).toBe('v2');
        });
      });

      describe('pour tous les services', () => {
        let televersementAvecDeuxServices: TeleversementServicesV2;

        beforeEach(() => {
          televersementAvecDeuxServices = new TeleversementServicesV2(
            {
              services: [
                structuredClone(ligneTeleverseeValide),
                { ...ligneTeleverseeValide, nom: 'Service B' },
              ],
            },
            referentiel
          );
        });

        it('fais les opérations pour tous les services', async () => {
          let servicesCrees = 0;
          depotDonnees.nouveauService = async () => {
            servicesCrees += 1;
            return unUUID('1');
          };

          await televersementAvecDeuxServices.creeLesServices(
            unUUID('2'),
            depotDonnees,
            busEvenement
          );

          expect(servicesCrees).toBe(2);
          expect(
            busEvenement.recupereEvenement(EvenementServicesImportes)
              .nbServicesImportes
          ).toBe(2);
        });

        it('délègue au dépôt de données la mise à jour successive de la progression de création des services du téléversement', async () => {
          const progressionsMiseAJour: number[] = [];
          let idUtilisateurRecu;
          depotDonnees.metsAJourProgressionTeleversement = async (
            idUtilisateur,
            index
          ) => {
            idUtilisateurRecu = idUtilisateur;
            progressionsMiseAJour.push(index);
          };

          await televersementAvecDeuxServices.creeLesServices(
            unUUID('2'),
            depotDonnees,
            busEvenement
          );

          expect(idUtilisateurRecu).toBe(unUUID('2'));
          expect(progressionsMiseAJour).toEqual([0, 1]);
        });
      });
    });
  });
});
