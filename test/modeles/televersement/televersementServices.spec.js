const expect = require('expect.js');
const TeleversementServices = require('../../../src/modeles/televersement/televersementServices');

describe('Un téléversement de services', () => {
  const donneesServiceValide = {
    nom: 'Nom du service',
    siret: '13000000000000',
    type: 'Site Internet',
    provenance: 'Proposé en ligne par un fournisseur',
    statut: 'En projet',
    localisation: 'France',
    dureeDysfonctionnement: "Plus d'une journée",
    dateHomologation: '01/01/2025',
    dureeHomologation: '6 mois',
    nomAutoriteHomologation: 'Nom Prénom',
    fonctionAutoriteHomologation: 'Fonction',
  };

  describe('sur demande de validation', () => {
    it('aggrège les erreurs de chaque service téléversé', () => {
      const erreursValidation = new TeleversementServices({
        services: [
          { ...donneesServiceValide, siret: 'pasUnSiret' },
          { ...donneesServiceValide, nom: 'Un autre nom', type: 'pasUnType' },
        ],
      }).valide();

      expect(erreursValidation.length).to.be(2);
      expect(erreursValidation[0].length).to.be(1);
      expect(erreursValidation[1].length).to.be(1);
    });

    it('ajoute le nom de chaque service téléversé à la liste de noms existants', () => {
      const erreursValidation = new TeleversementServices({
        services: [
          { ...donneesServiceValide, nom: 'Service A' },
          { ...donneesServiceValide, nom: 'Service B' },
          { ...donneesServiceValide, nom: 'Service B' },
        ],
      }).valide(['Service A']);

      expect(erreursValidation.length).to.be(3);
      expect(erreursValidation[0][0]).to.be('NOM_EXISTANT');
      expect(erreursValidation[1].length).to.be(0);
      expect(erreursValidation[2][0]).to.be('NOM_EXISTANT');
    });
  });
});
