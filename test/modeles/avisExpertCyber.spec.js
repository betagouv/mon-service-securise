const expect = require('expect.js');

const { ErreurAvisInvalide, ErreurDateRenouvellementInvalide } = require('../../src/erreurs');
const AvisExpertCyber = require('../../src/modeles/avisExpertCyber');

describe("L'avis de l'expert Cyber", () => {
  it('connaît ses constituants', () => {
    const avisExpert = new AvisExpertCyber({
      avis: AvisExpertCyber.FAVORABLE,
      dateRenouvellement: AvisExpertCyber.RENOUVELLEMENT_DANS_SIX_MOIS,
      commentaire: 'Un commentaire',
    });

    expect(avisExpert.dateRenouvellement).to.equal(AvisExpertCyber.RENOUVELLEMENT_DANS_SIX_MOIS);
    expect(avisExpert.commentaire).to.equal('Un commentaire');

    expect(avisExpert.favorable()).to.be(true);
  });

  it('sait se décrire au format JSON', () => {
    const avisExpert = new AvisExpertCyber({
      avis: AvisExpertCyber.FAVORABLE,
      dateRenouvellement: AvisExpertCyber.RENOUVELLEMENT_DANS_SIX_MOIS,
      commentaire: 'Un commentaire',
    });

    expect(avisExpert.toJSON()).to.eql({
      avis: AvisExpertCyber.FAVORABLE,
      dateRenouvellement: AvisExpertCyber.RENOUVELLEMENT_DANS_SIX_MOIS,
      commentaire: 'Un commentaire',
    });
  });

  it("vérifie que l'avis est favorable ou défavorable", (done) => {
    try {
      new AvisExpertCyber({ avis: 'avisInconnu' });
      done("La création de l'avis aurait dû lever une exception");
    } catch (e) {
      expect(e).to.be.a(ErreurAvisInvalide);
      expect(e.message).to.equal("L'avis \"avisInconnu\" est invalide");
      done();
    }
  });

  it('vérifie la validité du délai avant renouvellement', (done) => {
    try {
      new AvisExpertCyber({ dateRenouvellement: 'delaiInvalide' });
      done("La création de l'avis aurait dû lever une exception");
    } catch (e) {
      expect(e).to.be.a(ErreurDateRenouvellementInvalide);
      expect(e.message).to.equal('Le délai avant renouvellement "delaiInvalide" est invalide');
      done();
    }
  });
});
