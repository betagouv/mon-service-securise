import { beforeEach } from 'vitest';
import {
  LigneServiceTeleverseV2,
  ServiceTeleverseV2,
} from '../../../src/modeles/televersement/serviceTeleverseV2.js';
import { ReferentielV2 } from '../../../src/referentiel.interface.js';
import { creeReferentielV2 } from '../../../src/referentielV2.js';
import { uneChaineDeCaracteres } from '../../constructeurs/String.js';

const donneesServiceValide: LigneServiceTeleverseV2 = {
  nom: 'Mon service',
  siret: '13000000000000',
  statutDeploiement: 'En conception',
  typeService: ['Service en ligne', 'API'],
  typeHebergement: 'Hébergement interne (On-premise)',
  ouvertureSysteme: 'Accessible depuis internet',
  audienceCible: 'Large',
  dureeDysfonctionnementAcceptable: 'Moins de 4h',
  volumetrieDonneesTraitees: 'Faible',
  localisationDonneesTraitees: "Au sein de l'Union européenne",
  dateHomologation: new Date('2025-01-31'),
  dureeHomologation: '6 mois',
  nomAutoriteHomologation: 'Nom Prénom',
  fonctionAutoriteHomologation: 'Fonction',
};

describe('Un service téléversé V2', () => {
  let referentiel: ReferentielV2;

  beforeEach(() => {
    referentiel = creeReferentielV2();
  });

  describe('sur demande de validation', () => {
    it('ne retourne aucune erreur si le service est valide', () => {
      const erreursValidation = new ServiceTeleverseV2(
        { ...donneesServiceValide },
        referentiel
      ).valide();

      expect(erreursValidation).toHaveLength(0);
    });

    describe.each([
      {
        propriete: 'nom',
        valeurInvalide: uneChaineDeCaracteres(201, 'a'),
        idErreur: 'NOM_INVALIDE',
      },
      {
        propriete: 'siret',
        valeurInvalide: 'abc',
        idErreur: 'SIRET_INVALIDE',
      },
      {
        propriete: 'statutDeploiement',
        valeurInvalide: 'pasUnStatut',
        idErreur: 'STATUT_DEPLOIEMENT_INVALIDE',
      },
      {
        propriete: 'typeService',
        valeurInvalide: ['pasUnType', 'API'],
        idErreur: 'TYPE_INVALIDE',
      },
      {
        propriete: 'typeService',
        valeurInvalide: [],
        idErreur: 'TYPE_INVALIDE',
      },
      {
        propriete: 'typeHebergement',
        valeurInvalide: 'pasUnType',
        idErreur: 'TYPE_HEBERGEMENT_INVALIDE',
      },
      {
        propriete: 'ouvertureSysteme',
        valeurInvalide: 'pasUneOuverture',
        idErreur: 'OUVERTURE_SYSTEME_INVALIDE',
      },
      {
        propriete: 'audienceCible',
        valeurInvalide: 'pasUneAudienceCible',
        idErreur: 'AUDIENCE_CIBLE_INVALIDE',
      },
      {
        propriete: 'dureeDysfonctionnementAcceptable',
        valeurInvalide: 'pasUneDureeAcceptable',
        idErreur: 'DELAI_AVANT_IMPACT_CRITIQUE_INVALIDE',
      },
      {
        propriete: 'volumetrieDonneesTraitees',
        valeurInvalide: 'pasUneVolumetrie',
        idErreur: 'VOLUMETRIE_DONNEES_TRAITEES_INVALIDE',
      },
      {
        propriete: 'localisationDonneesTraitees',
        valeurInvalide: 'pasUneLocalisation',
        idErreur: 'LOCALISATION_INVALIDE',
      },
    ])("en cas d'erreur", ({ propriete, valeurInvalide, idErreur }) => {
      it(`retourne une erreur si '${propriete}' est invalide`, () => {
        const erreursValidation = new ServiceTeleverseV2(
          {
            ...donneesServiceValide,
            [propriete]: valeurInvalide,
          },
          referentiel
        ).valide();

        expect(erreursValidation).toHaveLength(1);
        expect(erreursValidation[0]).toBe(idErreur);
      });
    });

    describe('concernant le nom', () => {
      it('retourne un erreur si le nom est vide', () => {
        const erreursValidation = new ServiceTeleverseV2(
          {
            ...donneesServiceValide,
            nom: '',
          },
          referentiel
        ).valide();

        expect(erreursValidation).toHaveLength(1);
        expect(erreursValidation[0]).toBe('NOM_INVALIDE');
      });

      it("retourne une erreur si le nom existe déjà pour l'utilisateur", () => {
        const erreursValidation = new ServiceTeleverseV2(
          {
            ...donneesServiceValide,
            nom: 'Un nom existant',
          },
          referentiel
        ).valide(['Un nom existant']);

        expect(erreursValidation).toHaveLength(1);
        expect(erreursValidation[0]).toBe('NOM_EXISTANT');
      });
    });

    describe("concernant le dossier d'homologation", () => {
      it('retourne une erreur si les données du dossier sont partielles', () => {
        const erreursValidation = new ServiceTeleverseV2(
          {
            ...donneesServiceValide,
            dateHomologation: new Date(2025, 0, 31),
            dureeHomologation: '6 mois',
            nomAutoriteHomologation: '',
            fonctionAutoriteHomologation: '',
          },
          referentiel
        ).valide();

        expect(erreursValidation).toHaveLength(1);
        expect(erreursValidation[0]).toBe('DOSSIER_HOMOLOGATION_INCOMPLET');
      });

      it("ne retourne pas d'erreur si le dossier n'est pas défini", () => {
        const erreursValidation = new ServiceTeleverseV2(
          {
            ...donneesServiceValide,
            dateHomologation: undefined,
            dureeHomologation: undefined,
            nomAutoriteHomologation: undefined,
            fonctionAutoriteHomologation: undefined,
          },
          referentiel
        ).valide();

        expect(erreursValidation).toHaveLength(0);
      });

      describe('lorsque le dossier est complet', () => {
        it('retourne une erreur si la date est invalide', () => {
          const erreursValidation = new ServiceTeleverseV2(
            {
              ...donneesServiceValide,
              dateHomologation: new Date('pasUneDate'),
            },
            referentiel
          ).valide();

          expect(erreursValidation).toHaveLength(1);
          expect(erreursValidation[0]).toBe('DATE_HOMOLOGATION_INVALIDE');
        });

        it('retourne une erreur si la durée est invalide', () => {
          const erreursValidation = new ServiceTeleverseV2(
            {
              ...donneesServiceValide,
              dureeHomologation: 'pasUneDuree',
            },
            referentiel
          ).valide();

          expect(erreursValidation).toHaveLength(1);
          expect(erreursValidation[0]).toBe('DUREE_HOMOLOGATION_INVALIDE');
        });
      });
    });
  });

  describe('sur demande de conversion en données de service', () => {
    it('retourne les données de description', () => {
      const serviceTeleverse = new ServiceTeleverseV2(
        { ...donneesServiceValide },
        referentiel
      );

      const donneesService = serviceTeleverse.enDonneesService();

      expect(donneesService.descriptionService).toEqual({
        nomService: 'Mon service',
        organisationResponsable: { siret: '13000000000000' },
        statutDeploiement: 'enProjet',
        typeService: ['serviceEnLigne', 'api'],
        typeHebergement: 'onPremise',
        ouvertureSysteme: 'accessibleSurInternet',
        audienceCible: 'large',
        dureeDysfonctionnementAcceptable: 'moinsDe4h',
        volumetrieDonneesTraitees: 'faible',
        localisationDonneesTraitees: 'UE',
        niveauSecurite: 'niveau3',
        pointsAcces: [],
        activitesExternalisees: [],
        categoriesDonneesTraitees: [],
        categoriesDonneesTraiteesSupplementaires: [],
        specificitesProjet: [],
      });
      expect(donneesService.dossier).toEqual({
        decision: {
          dateHomologation: new Date('2025-01-31'),
          dureeValidite: 'sixMois',
        },
        autorite: { nom: 'Nom Prénom', fonction: 'Fonction' },
      });
    });

    it("sélectionne toutes les activités externalisées si le type d'hébergement est SaaS", () => {
      const serviceTeleverse = new ServiceTeleverseV2(
        {
          ...donneesServiceValide,
          typeHebergement:
            "Le système est entièrement fourni et vous l'utilisez directement via une interface (SaaS)",
        },
        referentiel
      );

      const { descriptionService } = serviceTeleverse.enDonneesService();

      expect(descriptionService.typeHebergement).toEqual('saas');
      expect(descriptionService.activitesExternalisees).toEqual([
        'administrationTechnique',
        'developpementLogiciel',
      ]);
    });

    describe("concernant le dossier d'homologation", () => {
      it("retourne les données du dossier s'il y'en a un", () => {
        const serviceTeleverse = new ServiceTeleverseV2(
          { ...donneesServiceValide },
          referentiel
        );

        const service = serviceTeleverse.enDonneesService();

        expect(service.dossier).toEqual({
          decision: {
            dateHomologation: new Date('2025-01-31'),
            dureeValidite: 'sixMois',
          },
          autorite: { nom: 'Nom Prénom', fonction: 'Fonction' },
        });
      });

      it("retourne 'undefined' s'il n'y a pas de dossier", () => {
        const serviceTeleverse = new ServiceTeleverseV2(
          {
            ...donneesServiceValide,
            dateHomologation: undefined,
            dureeHomologation: undefined,
            fonctionAutoriteHomologation: undefined,
            nomAutoriteHomologation: undefined,
          },
          referentiel
        );

        const service = serviceTeleverse.enDonneesService();
        expect(service.dossier).toBe(undefined);
      });
    });
  });
});
