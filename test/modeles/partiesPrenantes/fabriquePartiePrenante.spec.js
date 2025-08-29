import expect from 'expect.js';
import { ErreurTypeInconnu } from '../../../src/erreurs.js';
import { fabriquePartiePrenante } from '../../../src/modeles/partiesPrenantes/fabriquePartiePrenante.js';
import DeveloppementFourniture from '../../../src/modeles/partiesPrenantes/developpementFourniture.js';
import Hebergement from '../../../src/modeles/partiesPrenantes/hebergement.js';
import MaintenanceService from '../../../src/modeles/partiesPrenantes/maintenanceService.js';
import PartiePrenanteSpecifique from '../../../src/modeles/partiesPrenantes/partiePrenanteSpecifique.js';
import SecuriteService from '../../../src/modeles/partiesPrenantes/securiteService.js';

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
