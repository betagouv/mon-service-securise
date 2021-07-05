const expect = require('expect.js');

const PartiesPrenantes = require('../../src/modeles/partiesPrenantes');

describe("L'ensemble des parties prenantes", () => {
  it('connaît ses constituants', () => {
    const partiesPrenantes = new PartiesPrenantes({
      autoriteHomologation: 'Jean Dupont',
      fonctionAutoriteHomologation: 'Maire',
      piloteProjet: 'Sylvie Martin',
      expertCybersecurite: 'Anna Dubreuil',
    });

    expect(partiesPrenantes.autoriteHomologation).to.equal('Jean Dupont');
    expect(partiesPrenantes.fonctionAutoriteHomologation).to.equal('Maire');
    expect(partiesPrenantes.piloteProjet).to.equal('Sylvie Martin');
    expect(partiesPrenantes.expertCybersecurite).to.equal('Anna Dubreuil');
  });

  it('sait se présenter au format JSON', () => {
    const partiesPrenantes = new PartiesPrenantes({
      autoriteHomologation: 'Jean Dupont',
      fonctionAutoriteHomologation: 'Maire',
      piloteProjet: 'Sylvie Martin',
      expertCybersecurite: 'Anna Dubreuil',
    });

    expect(partiesPrenantes.toJSON()).to.eql({
      autoriteHomologation: 'Jean Dupont',
      fonctionAutoriteHomologation: 'Maire',
      piloteProjet: 'Sylvie Martin',
      expertCybersecurite: 'Anna Dubreuil',
    });
  });

  it('presente un JSON partiel si certaines parties prenantes ne sont pas définies', () => {
    const partiesPrenantes = new PartiesPrenantes();
    expect(partiesPrenantes.toJSON()).to.eql({});
  });
});
