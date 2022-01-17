const expect = require('expect.js');

const { ErreurAvisInvalide, ErreurDateRenouvellementInvalide } = require('../../src/erreurs');
const Referentiel = require('../../src/referentiel');
const AvisExpertCyber = require('../../src/modeles/avisExpertCyber');
const InformationsHomologation = require('../../src/modeles/informationsHomologation');

describe("L'avis de l'expert Cyber", () => {
  const referentiel = Referentiel.creeReferentiel({ echeancesRenouvellement: { unAn: {} } });

  it('connaît ses constituants', () => {
    const avisExpert = new AvisExpertCyber({
      avis: AvisExpertCyber.FAVORABLE,
      dateRenouvellement: 'unAn',
      commentaire: 'Un commentaire',
    }, referentiel);

    expect(avisExpert.dateRenouvellement).to.equal('unAn');
    expect(avisExpert.commentaire).to.equal('Un commentaire');
  });

  it('accepte le commentaire comme information facultative', () => {
    const avisExpert = new AvisExpertCyber();
    expect(avisExpert.proprietesAtomiquesFacultatives).to.eql(['commentaire']);
  });

  it("détecte si l'expert a donné un avis", () => {
    const avisExpert = new AvisExpertCyber();
    expect(avisExpert.favorable()).to.be(false);
    expect(avisExpert.defavorable()).to.be(false);
    expect(avisExpert.inconnu()).to.be(true);
  });

  it('sait détecter un avis favorable', () => {
    const avisExpert = new AvisExpertCyber({ avis: AvisExpertCyber.FAVORABLE }, referentiel);
    expect(avisExpert.favorable()).to.be(true);
    expect(avisExpert.defavorable()).to.be(false);
    expect(avisExpert.inconnu()).to.be(false);
  });

  it('sait détecter un avis défavorable', () => {
    const avisExpert = new AvisExpertCyber({ avis: AvisExpertCyber.DEFAVORABLE }, referentiel);
    expect(avisExpert.favorable()).to.be(false);
    expect(avisExpert.defavorable()).to.be(true);
    expect(avisExpert.inconnu()).to.be(false);
  });

  it('sait se décrire au format JSON', () => {
    const avisExpert = new AvisExpertCyber({
      avis: AvisExpertCyber.FAVORABLE,
      dateRenouvellement: 'unAn',
      commentaire: 'Un commentaire',
    }, referentiel);

    expect(avisExpert.toJSON()).to.eql({
      avis: AvisExpertCyber.FAVORABLE,
      dateRenouvellement: 'unAn',
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

  it("décrit l'échéance de l'homologation", () => {
    referentiel.descriptionExpiration = (identifiant) => {
      expect(identifiant).to.equal('unAn');
      return 'Une description';
    };

    const avisExpert = new AvisExpertCyber({ dateRenouvellement: 'unAn' }, referentiel);
    expect(avisExpert.descriptionExpiration()).to.equal('Une description');
  });

  it('détermine le statut de saisie', () => {
    const avisExpert = new AvisExpertCyber({
      avis: AvisExpertCyber.FAVORABLE, dateRenouvellement: 'unAn', commentaire: 'Un commentaire',
    }, referentiel);

    expect(avisExpert.statutSaisie()).to.equal(InformationsHomologation.COMPLETES);
  });

  it("n'exige pas que la date de renouvellement soit renseignée si l'avis est négatif", () => {
    const avisExpert = new AvisExpertCyber({ avis: AvisExpertCyber.DEFAVORABLE }, referentiel);

    expect(avisExpert.statutSaisie()).to.equal(InformationsHomologation.COMPLETES);
  });
});
