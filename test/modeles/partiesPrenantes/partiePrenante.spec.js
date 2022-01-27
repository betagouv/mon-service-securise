const expect = require('expect.js');

const PartiePrenante = require('../../../src/modeles/partiesPrenantes/partiePrenante');
const InformationsHomologation = require('../../../src/modeles/informationsHomologation');

const elle = it;

describe('Une partie prenante', () => {
  elle('est défini avec un type', () => {
    const partiePrenante = new PartiePrenante({ nom: 'hébergeur', type: 'type' });

    expect(partiePrenante.type).to.equal('type');
  });

  elle('est complète quand elle a un nom', () => {
    const partiePrenante = new PartiePrenante({ nom: 'hébergeur', type: 'type' });

    expect(partiePrenante.statutSaisie()).to.equal(InformationsHomologation.COMPLETES);
  });

  elle("est incomplète quand elle n'a pas de nom", () => {
    const partiePrenante = new PartiePrenante();

    expect(partiePrenante.statutSaisie()).to.equal(InformationsHomologation.A_SAISIR);
  });

  elle('connaît son nom', () => {
    const partiePrenante = new PartiePrenante({ nom: 'hébergeur', type: 'type' });

    expect(partiePrenante.nom).to.equal('hébergeur');
  });

  elle("connaît sa nature de l'accès", () => {
    const partiePrenante = new PartiePrenante({ natureAcces: "nature de l'accès", type: 'type' });

    expect(partiePrenante.natureAcces).to.equal("nature de l'accès");
  });

  elle('connaît son point de contact', () => {
    const partiePrenante = new PartiePrenante({ pointContact: 'point de contact', type: 'type' });

    expect(partiePrenante.pointContact).to.equal('point de contact');
  });

  elle('sait se décrire en json', () => {
    const partiePrenante = new PartiePrenante({ nom: 'hébergeur', type: 'type' });

    expect(partiePrenante.toJSON()).to.eql({ type: 'type', nom: 'hébergeur' });
  });
});
