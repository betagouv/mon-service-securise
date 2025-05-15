const expect = require('expect.js');
const TeleversementServices = require('../../../src/modeles/televersement/televersementServices');
const Referentiel = require('../../../src/referentiel');
const donneesReferentiel = require('../../../donneesReferentiel');

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
});
