import PartiesPrenantes from '../../../src/modeles/partiesPrenantes/partiesPrenantes.js';

describe('Les parties prenantes', () => {
  it('savent se décrire en JSON', () => {
    const partiesPrenantes = new PartiesPrenantes({
      partiesPrenantes: [{ type: 'Hebergement', nom: 'hébergeur' }],
    });

    expect(partiesPrenantes.toJSON()).toEqual([
      { type: 'Hebergement', nom: 'hébergeur' },
    ]);
  });

  it("savent transmettre l'hébergement", () => {
    const partiesPrenantes = new PartiesPrenantes({
      partiesPrenantes: [{ type: 'Hebergement', nom: 'hébergeur' }],
    });

    expect(partiesPrenantes.hebergement()).toEqual({
      type: 'Hebergement',
      nom: 'hébergeur',
    });
  });

  it('savent transmettre les informations du développement et fourniture du service', () => {
    const partiesPrenantes = new PartiesPrenantes({
      partiesPrenantes: [{ type: 'DeveloppementFourniture', nom: 'structure' }],
    });

    expect(partiesPrenantes.developpementFourniture()).toEqual({
      type: 'DeveloppementFourniture',
      nom: 'structure',
    });
  });

  it('savent transmettre la maintenance du service', () => {
    const partiesPrenantes = new PartiesPrenantes({
      partiesPrenantes: [{ type: 'MaintenanceService', nom: 'mainteneur' }],
    });

    expect(partiesPrenantes.maintenanceService()).toEqual({
      type: 'MaintenanceService',
      nom: 'mainteneur',
    });
  });

  it('savent transmettre la sécurité du service', () => {
    const partiesPrenantes = new PartiesPrenantes({
      partiesPrenantes: [
        { type: 'SecuriteService', nom: 'Structure supervision' },
      ],
    });

    expect(partiesPrenantes.securiteService()).toEqual({
      type: 'SecuriteService',
      nom: 'Structure supervision',
    });
  });

  it('savent transmettre les parties prenantes spécifiques', () => {
    const partiesPrenantes = new PartiesPrenantes({
      partiesPrenantes: [
        { type: 'PartiePrenanteSpecifique', nom: 'une partie' },
        { type: 'PartiePrenanteSpecifique', nom: 'une autre partie' },
      ],
    });

    expect(partiesPrenantes.specifiques()).to.have.length(2);
    expect(partiesPrenantes.specifiques()[0]).toEqual({
      type: 'PartiePrenanteSpecifique',
      nom: 'une partie',
    });
  });

  it('donnent la liste des propriétés de la partie prenante', () => {
    expect(PartiesPrenantes.proprietesItem()).toEqual([
      'nom',
      'natureAcces',
      'pointContact',
    ]);
  });
});
