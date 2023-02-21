const expect = require('expect.js');

const DatesTelechargements = require('../../../src/modeles/etapes/datesTelechargements');
const Referentiel = require('../../../src/referentiel');
const { ErreurDocumentHomologationInconnu } = require('../../../src/erreurs');

describe("Les dates de téléchargements des documents d'homologation", () => {
  let referentiel;
  beforeEach(() => {
    referentiel = Referentiel.creeReferentiel({
      documentsHomologation: { decision: {} },
    });
  });

  it('exigent que les documents soient connus', () => {
    expect(() => {
      new DatesTelechargements({
        documentInconnu: '2023-01-01T00:00:00.000Z',
      }, referentiel);
    }).to.throwError((e) => expect(e).to.be.an(ErreurDocumentHomologationInconnu));
  });

  describe('sur demande de conversion en JSON', () => {
    it('savent se convertir en JSON', () => {
      const datesTelechargements = new DatesTelechargements({
        decision: '2023-02-02T00:00:00.000Z',
      }, referentiel);

      expect(datesTelechargements.toJSON()).to.eql({
        decision: '2023-02-02T00:00:00.000Z',
      });
    });

    it("excluent les documents qui n'ont pas été téléchargés", () => {
      referentiel = Referentiel.creeReferentiel({
        documentsHomologation: { decision: {}, annexes: {} },
      });
      const sansTelechargementDecision = new DatesTelechargements({
        annexes: '2023-02-02T00:00:00.000Z',
      }, referentiel);

      expect(sansTelechargementDecision.toJSON()).to.eql({
        annexes: '2023-02-02T00:00:00.000Z',
      });
    });
  });

  describe("sur vérification qu'elles sont complètes", () => {
    beforeEach(() => {
      referentiel = Referentiel.creeReferentiel({
        documentsHomologation: { decision: {}, annexes: {} },
      });
    });

    it("retourne `false` dès qu'un document n'a pas été téléchargé", () => {
      const sansTelechargementDecision = new DatesTelechargements({
        annexes: '2023-02-02T00:00:00.000Z',
      }, referentiel);
      expect(sansTelechargementDecision.estComplete()).to.be(false);
    });

    it('retourne `true` si toutes les documents ont été téléchargés', () => {
      const tousTelecharges = new DatesTelechargements({
        annexes: '2023-02-02T00:00:00.000Z',
        decision: '2023-01-01T00:00:00.000Z',
      }, referentiel);
      expect(tousTelecharges.estComplete()).to.be(true);
    });
  });
});
