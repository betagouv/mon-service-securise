import PartiePrenante from '../../../src/modeles/partiesPrenantes/partiePrenante.js';
import InformationsService from '../../../src/modeles/informationsService.js';

describe('Une partie prenante', () => {
  const LaPartiePrenante = class LaPartiePrenante extends PartiePrenante {};

  it('est complète quand elle a un nom', () => {
    const partiePrenante = new PartiePrenante({ nom: 'hébergeur' });

    expect(partiePrenante.statutSaisie()).toEqual(
      InformationsService.COMPLETES
    );
  });

  it("est incomplète quand elle n'a pas de nom", () => {
    const partiePrenante = new PartiePrenante();

    expect(partiePrenante.statutSaisie()).toEqual(InformationsService.A_SAISIR);
  });

  it('connaît son nom', () => {
    const partiePrenante = new PartiePrenante({ nom: 'hébergeur' });

    expect(partiePrenante.nom).toEqual('hébergeur');
  });

  it("connaît sa nature de l'accès", () => {
    const partiePrenante = new PartiePrenante({
      natureAcces: "nature de l'accès",
    });

    expect(partiePrenante.natureAcces).toEqual("nature de l'accès");
  });

  it('connaît son point de contact', () => {
    const partiePrenante = new PartiePrenante({
      pointContact: 'point de contact',
    });

    expect(partiePrenante.pointContact).toEqual('point de contact');
  });

  it('indique si son type est le même que celui demandé', () => {
    const partiePrenante = new LaPartiePrenante();

    expect(partiePrenante.estDeType(LaPartiePrenante)).toBe(true);
  });

  it("indique si son type n'est pas le même que celui demandé", () => {
    const partiePrenante = new PartiePrenante();

    expect(partiePrenante.estDeType(LaPartiePrenante)).toBe(false);
  });

  it('reste robuste face à une demande avec un type non valide', () => {
    const LaPartiePrenanteNonValide = null;
    const partiePrenante = new PartiePrenante();

    expect(partiePrenante.estDeType(LaPartiePrenanteNonValide)).toBe(false);
  });
});
