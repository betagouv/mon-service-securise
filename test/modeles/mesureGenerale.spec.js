const expect = require('expect.js');

const { ErreurMesureInconnue, ErreurStatutMesureInvalide } = require('../../src/erreurs');
const Referentiel = require('../../src/referentiel');
const MesureGenerale = require('../../src/modeles/mesureGenerale');

describe('Une mesure de sécurité', () => {
  let referentiel;

  beforeEach(() => (referentiel = Referentiel.creeReferentiel({
    mesures: {
      identifiantMesure: { description: 'Une description' },
      identifiantMesureIndispensable: {
        description: 'Cette mesure est indispensable',
        indispensable: true,
      },
    },
  })));

  it('sait se décrire', () => {
    const mesure = new MesureGenerale({
      id: 'identifiantMesure',
      statut: MesureGenerale.STATUT_FAIT,
      modalites: "Des modalités d'application",
    }, referentiel);

    expect(mesure.id).to.equal('identifiantMesure');
    expect(mesure.statut).to.equal(MesureGenerale.STATUT_FAIT);
    expect(mesure.modalites).to.equal("Des modalités d'application");
    expect(mesure.toJSON()).to.eql({
      id: 'identifiantMesure',
      statut: MesureGenerale.STATUT_FAIT,
      modalites: "Des modalités d'application",
    });
  });

  it('vérifie que la mesure est bien répertoriée', (done) => {
    try {
      new MesureGenerale({ id: 'identifiantInconnu', statut: MesureGenerale.STATUT_FAIT }, referentiel);
      done('La création de la mesure aurait dû lever une exception');
    } catch (e) {
      expect(e).to.be.a(ErreurMesureInconnue);
      expect(e.message).to.equal("La mesure \"identifiantInconnu\" n'est pas répertoriée");
      done();
    }
  });

  it('vérifie la nature du statut', (done) => {
    try {
      new MesureGenerale({ id: 'identifiantMesure', statut: 'statutInvalide' }, referentiel);
      done('La création de la mesure aurait dû lever une exception');
    } catch (e) {
      expect(e).to.be.a(ErreurStatutMesureInvalide);
      expect(e.message).to.equal('Le statut "statutInvalide" est invalide');
      done();
    }
  });

  it('connaît sa description', () => {
    expect(referentiel.mesures().identifiantMesure.description).to.equal('Une description');

    const mesure = new MesureGenerale({ id: 'identifiantMesure', statut: 'fait' }, referentiel);
    expect(mesure.descriptionMesure()).to.equal('Une description');
  });

  it("sait si elle est indispensable selon l'ANSSI", () => {
    expect(referentiel.mesures().identifiantMesureIndispensable.indispensable).to.be(true);

    const mesureIndispensable = new MesureGenerale(
      { id: 'identifiantMesureIndispensable', statut: 'fait' }, referentiel
    );
    expect(mesureIndispensable.estIndispensable()).to.be(true);
  });

  it('sait si elle est seulement recommandée', () => {
    expect(referentiel.mesures().identifiantMesure.indispensable).to.not.be.ok();

    const mesure = new MesureGenerale({ id: 'identifiantMesure', statut: 'fait' }, referentiel);
    expect(mesure.estIndispensable()).to.be(false);
  });
});
