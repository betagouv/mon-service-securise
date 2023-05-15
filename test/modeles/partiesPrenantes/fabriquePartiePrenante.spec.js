const expect = require('expect.js');

const { ErreurTypeInconnu } = require('../../../src/erreurs');
const fabriquePartiePrenante = require('../../../src/modeles/partiesPrenantes/fabriquePartiePrenante');
const DeveloppementFourniture = require('../../../src/modeles/partiesPrenantes/developpementFourniture');
const Hebergement = require('../../../src/modeles/partiesPrenantes/hebergement');
const MaintenanceService = require('../../../src/modeles/partiesPrenantes/maintenanceService');
const PartiePrenanteSpecifique = require('../../../src/modeles/partiesPrenantes/partiePrenanteSpecifique');
const SecuriteService = require('../../../src/modeles/partiesPrenantes/securiteService');

describe('La fabrique de partie prenante', () => {
  it('fabrique des hébergements', () => {
    const hebergement = fabriquePartiePrenante.cree({
      type: 'Hebergement',
      nom: 'Un hébergeur',
    });
    expect(hebergement).to.be.an(Hebergement);
  });

  it('fabrique des développements / fournitures de service', () => {
    const developpementFourniture = fabriquePartiePrenante.cree({
      type: 'DeveloppementFourniture',
      nom: 'Mss',
    });
    expect(developpementFourniture).to.be.a(DeveloppementFourniture);
  });

  it('fabrique des maintenances du service', () => {
    const maintenanceService = fabriquePartiePrenante.cree({
      type: 'MaintenanceService',
      nom: 'Mss',
    });
    expect(maintenanceService).to.be.a(MaintenanceService);
  });

  it('fabrique des sécurité du service', () => {
    const securiteService = fabriquePartiePrenante.cree({
      type: 'SecuriteService',
      nom: 'Structure supervision',
    });
    expect(securiteService).to.be.a(SecuriteService);
  });

  it('fabrique des parties prenantes spécifiques', () => {
    const partiePrenanteSpecifique = fabriquePartiePrenante.cree({
      type: 'PartiePrenanteSpecifique',
      nom: 'Partie',
    });
    expect(partiePrenanteSpecifique).to.be.a(PartiePrenanteSpecifique);
  });

  it('retourne une erreur si le type est inconnu', () => {
    expect(() =>
      fabriquePartiePrenante.cree({ type: 'inconnu' })
    ).to.throwException((e) => {
      expect(e).to.be.an(ErreurTypeInconnu);
      expect(e.message).to.equal('Le type "inconnu" est inconnu');
    });
  });
});
