const expect = require('expect.js');
const ServiceTeleverse = require('../../../src/modeles/televersement/serviceTeleverse');
const Referentiel = require('../../../src/referentiel');
const donneesReferentiel = require('../../../donneesReferentiel');

describe('Un service téléversé', () => {
  let referentiel;

  beforeEach(() => {
    referentiel = Referentiel.creeReferentiel({ ...donneesReferentiel });
  });

  describe('sur demande de validation', () => {
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

    it('ne retourne aucune erreur si le service est valide', () => {
      const erreursValidation = new ServiceTeleverse(
        { ...donneesServiceValide },
        referentiel
      ).valide();

      expect(erreursValidation.length).to.be(0);
    });

    describe("en cas d'erreur", () => {
      [
        ['siret', 'abc', 'SIRET_INVALIDE'],
        ['type', 'pasUnType', 'TYPE_INVALIDE'],
        ['provenance', 'pasUneProvenance', 'PROVENANCE_INVALIDE'],
        ['statut', 'pasUnStatut', 'STATUT_INVALIDE'],
        ['localisation', 'pasUneLocalisation', 'LOCALISATION_INVALIDE'],
        [
          'delaiAvantImpactCritique',
          'pasUneDurée',
          'DELAI_AVANT_IMPACT_CRITIQUE_INVALIDE',
        ],
      ].forEach(([propriete, valeurInvalide, idErreur]) => {
        it(`retourne une erreur si '${propriete}' est invalide`, () => {
          const erreursValidation = new ServiceTeleverse(
            {
              ...donneesServiceValide,
              [propriete]: valeurInvalide,
            },
            referentiel
          ).valide();

          expect(erreursValidation.length).to.be(1);
          expect(erreursValidation[0]).to.be(idErreur);
        });
      });

      describe('concernant le nom', () => {
        it('retourne un erreur si le nom est vide', () => {
          const erreursValidation = new ServiceTeleverse(
            {
              ...donneesServiceValide,
              nom: '',
            },
            referentiel
          ).valide();

          expect(erreursValidation.length).to.be(1);
          expect(erreursValidation[0]).to.be('NOM_INVALIDE');
        });

        it("retourne une erreur si le nom existe déjà pour l'utilisateur", () => {
          const erreursValidation = new ServiceTeleverse(
            {
              ...donneesServiceValide,
              nom: 'Un nom existant',
            },
            referentiel
          ).valide(['Un nom existant']);

          expect(erreursValidation.length).to.be(1);
          expect(erreursValidation[0]).to.be('NOM_EXISTANT');
        });
      });
    });

    describe("concernant le dossier d'homologation", () => {
      it('retourne une erreur si les données du dossier sont partielles', () => {
        const erreursValidation = new ServiceTeleverse(
          {
            ...donneesServiceValide,
            dateHomologation: '01/01/2025',
            dureeHomologation: '6 mois',
            nomAutoriteHomologation: '',
            fonctionAutoriteHomologation: '',
          },
          referentiel
        ).valide();

        expect(erreursValidation.length).to.be(1);
        expect(erreursValidation[0]).to.be('DOSSIER_HOMOLOGATION_INCOMPLET');
      });

      it("ne retourne pas d'erreur si le dossier n'est pas défini", () => {
        const erreursValidation = new ServiceTeleverse(
          {
            ...donneesServiceValide,
            dateHomologation: '',
            dureeHomologation: '',
            nomAutoriteHomologation: '',
            fonctionAutoriteHomologation: '',
          },
          referentiel
        ).valide();

        expect(erreursValidation.length).to.be(0);
      });

      describe('lorsque le dossier est complet', () => {
        it('retourne une erreur si la date est invalide', () => {
          const erreursValidation = new ServiceTeleverse(
            {
              ...donneesServiceValide,
              dateHomologation: 'pasUneDate',
            },
            referentiel
          ).valide();

          expect(erreursValidation.length).to.be(1);
          expect(erreursValidation[0]).to.be('DATE_HOMOLOGATION_INVALIDE');
        });

        it('retourne une erreur si la durée est invalide', () => {
          const erreursValidation = new ServiceTeleverse(
            {
              ...donneesServiceValide,
              dureeHomologation: 'pasUneDuree',
            },
            referentiel
          ).valide();

          expect(erreursValidation.length).to.be(1);
          expect(erreursValidation[0]).to.be('DUREE_HOMOLOGATION_INVALIDE');
        });
      });
    });
  });
});
