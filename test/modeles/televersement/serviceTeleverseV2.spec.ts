import {
  DonneesServiceTeleverseV2,
  ServiceTeleverseV2,
} from '../../../src/modeles/televersement/serviceTeleverseV2.js';
// import { DescriptionServiceV2 } from '../../../src/modeles/descriptionServiceV2.js';
import { ReferentielV2 } from '../../../src/referentiel.interface.js';
import { creeReferentielV2 } from '../../../src/referentielV2.js';

type DonneesDossierHomologation = {
  dateHomologation: string;
  dureeHomologation: string;
  nomAutoriteHomologation: string;
  fonctionAutoriteHomologation: string;
};

const donneesServiceValide: DonneesServiceTeleverseV2 &
  DonneesDossierHomologation = {
  nom: 'Mon service',
  siret: '13000000000000',
  statutDeploiement: 'En conception',
  dateHomologation: '01/01/2025',
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
    // it('ne retourne aucune erreur si le service est valide', () => {
    //   const erreursValidation = new ServiceTeleverse(
    //     { ...donneesServiceValide },
    //     referentiel
    //   ).valide();
    //
    //   expect(erreursValidation.length).to.be(0);
    // });

    describe("en cas d'erreur", () => {
      [
        ['siret', 'abc', 'SIRET_INVALIDE'],
        ['statutDeploiement', 'pasUnStatut', 'STATUT_DEPLOIEMENT_INVALIDE'],
        // [
        //   'nombreOrganisationsUtilisatrices',
        //   'pasUnNombre',
        //   'NOMBRE_ORGANISATIONS_UTILISATRICES_INVALIDE',
        // ],
        // ['provenance', 'pasUneProvenance', 'PROVENANCE_INVALIDE'],
        // ['statut', 'pasUnStatut', 'STATUT_INVALIDE'],
        // ['localisation', 'pasUneLocalisation', 'LOCALISATION_INVALIDE'],
        // [
        //   'delaiAvantImpactCritique',
        //   'pasUneDurée',
        //   'DELAI_AVANT_IMPACT_CRITIQUE_INVALIDE',
        // ],
      ].forEach(([propriete, valeurInvalide, idErreur]) => {
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

      // it('accumule les erreurs de description et de dossier', () => {
      //   const erreursValidation = new ServiceTeleverseV2(
      //     {
      //       ...donneesServiceValide,
      //       type: 'pasUnType',
      //       statut: 'pasUnStatut',
      //       dateHomologation: 'pasUneDate',
      //     },
      //     referentiel
      //   ).valide();
      //
      //   expect(erreursValidation.length).to.be(3);
      // });
    });

    describe("concernant le dossier d'homologation", () => {
      it('retourne une erreur si les données du dossier sont partielles', () => {
        const erreursValidation = new ServiceTeleverseV2(
          {
            ...donneesServiceValide,
            dateHomologation: '01/01/2025',
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
            dateHomologation: '',
            dureeHomologation: '',
            nomAutoriteHomologation: '',
            fonctionAutoriteHomologation: '',
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
              dateHomologation: 'pasUneDate',
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

  // describe('sur demande de conversion en données de service', () => {
  //   it('retourne les données de description', () => {
  //     const serviceTeleverse = new ServiceTeleverse(
  //       { ...donneesServiceValide },
  //       referentiel
  //     );
  //
  //     const donneesService = serviceTeleverse.enDonneesService();
  //
  //     expect(donneesService.descriptionService).to.eql({
  //       delaiAvantImpactCritique: 'plusUneJournee',
  //       localisationDonnees: 'france',
  //       nomService: 'Nom du service',
  //       provenanceService: 'achat',
  //       statutDeploiement: 'enProjet',
  //       typeService: ['siteInternet'],
  //       niveauSecurite: 'niveau1',
  //       nombreOrganisationsUtilisatrices: {
  //         borneBasse: 1,
  //         borneHaute: 1,
  //       },
  //       organisationResponsable: {
  //         siret: '13000000000000',
  //       },
  //     });
  //   });
  //
  //   describe("concernant le dossier d'homologation", () => {
  //     it("retourne les données du dossier s'il y'en a un", () => {
  //       const serviceTeleverse = new ServiceTeleverse(
  //         { ...donneesServiceValide },
  //         referentiel
  //       );
  //
  //       const service = serviceTeleverse.enDonneesService();
  //
  //       expect(service.dossier).to.eql({
  //         decision: {
  //           dateHomologation: '01/01/2025',
  //           dureeValidite: 'sixMois',
  //         },
  //         autorite: {
  //           nom: 'Nom Prénom',
  //           fonction: 'Fonction',
  //         },
  //       });
  //     });
  //
  //     it("retourne 'undefined' s'il n'y a pas de dossier", () => {
  //       const serviceTeleverse = new ServiceTeleverse(
  //         {
  //           ...donneesServiceValide,
  //           dateHomologation: undefined,
  //           dureeHomologation: undefined,
  //         },
  //         referentiel
  //       );
  //
  //       const service = serviceTeleverse.enDonneesService();
  //       expect(service.dossier).to.be(undefined);
  //     });
  //   });
  // });

  describe('sur demande de siret formatté', () => {
    it('supprime tous les caractères non-numérique', () => {
      const serviceTeleverse = new ServiceTeleverseV2(
        { ...donneesServiceValide, siret: '123 456 abc  124124 ' },
        referentiel
      );

      expect(serviceTeleverse.siretFormatte()).toBe('123456124124');
    });
  });
});
