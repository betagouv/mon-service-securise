const expect = require('expect.js');
const TeleversementServices = require('../../../src/modeles/televersement/televersementServices');
const Referentiel = require('../../../src/referentiel');
const donneesReferentiel = require('../../../donneesReferentiel');
const { ErreurTeleversementServicesInvalide } = require('../../../src/erreurs');
const Dossier = require('../../../src/modeles/dossier');
const { fabriqueBusPourLesTests } = require('../../bus/aides/busPourLesTests');
const EvenementServicesImportes = require('../../../src/bus/evenementServicesImportes');
const EvenementDossierHomologationImporte = require('../../../src/bus/evenementDossierHomologationImporte');

describe('Un téléversement de services', () => {
  let referentiel;
  const donneesServiceValide = {
    nom: 'Nom du service',
    siret: '13000000000000',
    type: 'Site Internet',
    provenance: 'Proposé en ligne par un fournisseur',
    statut: 'En projet',
    localisation: 'France',
    delaiAvantImpactCritique: "Plus d'une journée",
    dateHomologation: '01/01/2025',
    dureeHomologation: '6 mois',
    nomAutoriteHomologation: 'Nom Prénom',
    fonctionAutoriteHomologation: 'Fonction',
  };

  beforeEach(() => {
    referentiel = Referentiel.creeReferentiel({ ...donneesReferentiel });
  });

  describe('sur demande de validation', () => {
    it('aggrège les erreurs de chaque service téléversé', () => {
      const erreursValidation = new TeleversementServices(
        {
          services: [
            { ...donneesServiceValide, siret: 'pasUnSiret' },
            { ...donneesServiceValide, nom: 'Un autre nom', type: 'pasUnType' },
          ],
        },
        referentiel
      ).valide();

      expect(erreursValidation.length).to.be(2);
      expect(erreursValidation[0].length).to.be(1);
      expect(erreursValidation[1].length).to.be(1);
    });

    it('ajoute le nom de chaque service téléversé à la liste de noms existants', () => {
      const erreursValidation = new TeleversementServices(
        {
          services: [
            { ...donneesServiceValide, nom: 'Service A' },
            { ...donneesServiceValide, nom: 'Service B' },
            { ...donneesServiceValide, nom: 'Service B' },
          ],
        },
        referentiel
      ).valide(['Service A']);

      expect(erreursValidation.length).to.be(3);
      expect(erreursValidation[0][0]).to.be('NOM_EXISTANT');
      expect(erreursValidation[1].length).to.be(0);
      expect(erreursValidation[2][0]).to.be('NOM_EXISTANT');
    });
  });

  describe('sur demande de rapport détaillé', () => {
    it("renvoie les services avec leur rapport d'erreur", () => {
      const serviceA = { ...donneesServiceValide, nom: 'Service A' };
      const serviceB = {
        ...donneesServiceValide,
        nom: 'Service B',
        siret: 'pasUnSiret',
      };
      const rapport = new TeleversementServices(
        {
          services: [serviceA, serviceB],
        },
        referentiel
      ).rapportDetaille();

      expect(rapport.services).to.eql([
        { service: serviceA, erreurs: [] },
        { service: serviceB, erreurs: ['SIRET_INVALIDE'] },
      ]);
    });

    describe('concernant le statut renvoyé', () => {
      it('renvoie un statut "Invalide" si des erreurs sont présentes', () => {
        const rapport = new TeleversementServices(
          {
            services: [{ ...donneesServiceValide, siret: 'pasUnSiret' }],
          },
          referentiel
        ).rapportDetaille();

        expect(rapport.statut).to.be('INVALIDE');
      });

      it('renvoie un statut "Valide" si aucune erreur n\'est présente', () => {
        const rapport = new TeleversementServices(
          {
            services: [{ ...donneesServiceValide }],
          },
          referentiel
        ).rapportDetaille();

        expect(rapport.statut).to.be('VALIDE');
      });
    });
  });

  describe('sur demande de création des services', () => {
    let depotDonnees;
    let busEvenement;

    beforeEach(() => {
      depotDonnees = {
        nouveauService: async () => 'S1',
        ajouteSuggestionAction: async () => {},
        ajouteDossierCourantSiNecessaire: async () => new Dossier({ id: 'D1' }),
        enregistreDossier: async () => {},
      };
      busEvenement = fabriqueBusPourLesTests();
    });

    it('jette une erreur si son contenu est invalide', async () => {
      const nomsServicesExistants = ['Service A'];
      const donneesServiceNomIdentique = {
        ...donneesServiceValide,
        nom: 'Service A',
      };
      const televersementInvalide = new TeleversementServices(
        { services: [donneesServiceNomIdentique] },
        referentiel
      );

      try {
        await televersementInvalide.creeLesServices(
          'U1',
          nomsServicesExistants,
          depotDonnees,
          busEvenement
        );
        expect().fail("L'appel aurai dû lever une erreur");
      } catch (e) {
        expect(e).to.be.an(ErreurTeleversementServicesInvalide);
      }
    });

    describe('pour chaque service à créer', () => {
      let televersement;

      beforeEach(() => {
        televersement = new TeleversementServices(
          { services: [structuredClone(donneesServiceValide)] },
          referentiel
        );
      });

      it('délègue au dépôt de données la création du service', async () => {
        let donneesRecues;
        depotDonnees.nouveauService = async (idUtilisateur, donnees) => {
          donneesRecues = { idUtilisateur, donnees };
          return 'S1';
        };

        await televersement.creeLesServices(
          'U1',
          [],
          depotDonnees,
          busEvenement
        );
        expect(donneesRecues.idUtilisateur).to.be('U1');
        expect(donneesRecues.donnees).not.to.be(undefined);
      });

      describe("si le service a un dossier d'homologation", () => {
        it("délègue au dépôt de données la création d'un dossier", async () => {
          let idRecu;
          depotDonnees.ajouteDossierCourantSiNecessaire = async (idService) => {
            idRecu = idService;
            return new Dossier({ id: 'D1' });
          };

          await televersement.creeLesServices(
            'U1',
            [],
            depotDonnees,
            busEvenement
          );
          expect(idRecu).to.be('S1');
        });

        it('complète le dossier avec les données du téléversement', async () => {
          const dossierRecu = new Dossier({ id: 'D1' }, referentiel);
          depotDonnees.ajouteDossierCourantSiNecessaire = async () =>
            dossierRecu;

          await televersement.creeLesServices(
            'U1',
            [],
            depotDonnees,
            busEvenement
          );

          expect(dossierRecu.toJSON()).to.eql({
            id: 'D1',
            finalise: true,
            importe: true,
            decision: {
              dateHomologation: '01/01/2025',
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
              date: '01/01/2025',
            },
          });
        });

        it("délègue au dépôt de données l'enregistrement du dossier finalisé", async () => {
          let donneesRecues;
          depotDonnees.enregistreDossier = async (idService, dossier) => {
            donneesRecues = { idService, dossier };
          };

          await televersement.creeLesServices(
            'U1',
            [],
            depotDonnees,
            busEvenement
          );

          expect(donneesRecues.idService).to.be('S1');
          expect(donneesRecues.dossier.finalise).to.be(true);
          expect(donneesRecues.dossier.importe).to.be(true);
        });

        it("publie un évènement d'homologation importée sur le bus", async () => {
          await televersement.creeLesServices(
            'U1',
            [],
            depotDonnees,
            busEvenement
          );

          expect(
            busEvenement.aRecuUnEvenement(EvenementDossierHomologationImporte)
          ).to.be(true);
          expect(
            busEvenement.recupereEvenement(EvenementDossierHomologationImporte)
              .idService
          ).to.be('S1');
        });
      });

      it("ne créé pas de dossier si le service téléversé n'en a pas", async () => {
        let depotAppele = false;
        depotDonnees.ajouteDossierCourantSiNecessaire = async () => {
          depotAppele = true;
        };

        televersement = new TeleversementServices(
          {
            services: [
              {
                ...donneesServiceValide,
                dateHomologation: undefined,
                dureeHomologation: undefined,
                nomAutoriteHomologation: undefined,
                fonctionAutoriteHomologation: undefined,
              },
            ],
          },
          referentiel
        );

        await televersement.creeLesServices(
          'U1',
          [],
          depotDonnees,
          busEvenement
        );
        expect(depotAppele).to.be(false);
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
          'U1',
          [],
          depotDonnees,
          busEvenement
        );
        expect(donneesRecues.idService).to.be('S1');
        expect(donneesRecues.natureSuggestion).to.be(
          'finalisationDescriptionServiceImporte'
        );
      });

      it('publie un évènement sur le bus', async () => {
        await televersement.creeLesServices(
          'U1',
          [],
          depotDonnees,
          busEvenement
        );

        expect(busEvenement.aRecuUnEvenement(EvenementServicesImportes)).to.be(
          true
        );
        expect(
          busEvenement.recupereEvenement(EvenementServicesImportes)
            .nbServicesImportes
        ).to.be(1);
      });
    });

    it('fais les opérations pour tous les services', async () => {
      const televersement = new TeleversementServices(
        {
          services: [
            structuredClone(donneesServiceValide),
            { ...donneesServiceValide, nom: 'Service B' },
          ],
        },
        referentiel
      );

      let servicesCrees = 0;
      depotDonnees.nouveauService = async () => {
        servicesCrees += 1;
        return 'S1';
      };

      await televersement.creeLesServices('U1', [], depotDonnees, busEvenement);

      expect(servicesCrees).to.be(2);
      expect(
        busEvenement.recupereEvenement(EvenementServicesImportes)
          .nbServicesImportes
      ).to.be(2);
    });
  });
});
