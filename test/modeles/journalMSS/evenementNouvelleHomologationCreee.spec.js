const expect = require('expect.js');
const EvenementNouvelleHomologationCreee = require('../../../src/modeles/journalMSS/evenementNouvelleHomologationCreee');
require('./constructeurEvenementCompletudeServiceModifiee');
require('../../../src/modeles/journalMSS/evenementCompletudeServiceModifiee');
const {
  ErreurIdentifiantServiceManquant,
  ErreurDateHomologationManquante, ErreurDureeHomologationManquante,
} = require('../../../src/modeles/journalMSS/erreurs');

describe('Un événement de nouvelle homologation', () => {
  const hacheEnMajuscules = { hacheSha256: (valeur) => valeur?.toUpperCase() };

  it("chiffre l'identifiant du service qui lui est donné", () => {
    const evenement = new EvenementNouvelleHomologationCreee(
      { idService: 'abc', dateHomologation: '2023-03-30', dureeHomologationMois: 24 },
      { adaptateurChiffrement: hacheEnMajuscules }
    );

    expect(evenement.donnees.idService).to.be('ABC');
  });

  it('sait se convertir en JSON', () => {
    const evenement = new EvenementNouvelleHomologationCreee(
      { idService: 'abc', dateHomologation: '25/03/2023', dureeHomologationMois: 24 },
      { date: '27/03/2023', adaptateurChiffrement: hacheEnMajuscules }
    );

    expect(evenement.toJSON()).to.eql({
      type: 'NOUVELLE_HOMOLOGATION_CREEE',
      donnees: {
        idService: 'ABC', dateHomologation: '25/03/2023', dureeHomologationMois: 24,
      },
      date: '27/03/2023',
    });
  });

  it("exige que l'identifiant du service soit renseigné", () => {
    expect(() => new EvenementNouvelleHomologationCreee({})).to.throwError((e) => {
      expect(e).to.be.an(ErreurIdentifiantServiceManquant);
    });
  });

  it("exige que la date d'homologation soit renseignée", () => {
    expect(() => new EvenementNouvelleHomologationCreee({ idService: 'abc' })).to.throwError((e) => {
      expect(e).to.be.an(ErreurDateHomologationManquante);
    });
  });

  it("exige que la durée d'homologation soit renseignée", () => {
    expect(() => new EvenementNouvelleHomologationCreee(
      { idService: 'abc', dateHomologation: '2023-03-30' }
    )).to.throwError((e) => {
      expect(e).to.be.an(ErreurDureeHomologationManquante);
    });
  });
});
