const expect = require('expect.js');

const { ErreurMesureInconnue, ErreurStatutMesureInvalide } = require('../../src/erreurs');
const Referentiel = require('../../src/referentiel');
const Mesure = require('../../src/modeles/mesure');

describe('Une mesure de sécurité', () => {
  let referentiel;

  beforeEach(() => (referentiel = Referentiel.creeReferentiel({
    mesures: {
      identifiantMesure: { description: 'Une description' },
    },
  })));

  it('sait se décrire', () => {
    const mesure = new Mesure({
      id: 'identifiantMesure',
      statut: Mesure.STATUT_FAIT,
      modalites: "Des modalités d'application",
    }, referentiel);

    expect(mesure.id).to.equal('identifiantMesure');
    expect(mesure.statut).to.equal(Mesure.STATUT_FAIT);
    expect(mesure.modalites).to.equal("Des modalités d'application");
  });

  it('vérifie que la mesure est bien répertoriée', (done) => {
    try {
      new Mesure({ id: 'identifiantInconnu', statut: Mesure.STATUT_FAIT }, referentiel);
      done('La création de la mesure aurait dû lever une exception');
    } catch (e) {
      expect(e).to.be.a(ErreurMesureInconnue);
      expect(e.message).to.equal("La mesure \"identifiantInconnu\" n'est pas répertoriée");
      done();
    }
  });

  it('vérifie la nature du statut', (done) => {
    try {
      new Mesure({ id: 'identifiantMesure', statut: 'statutInvalide' }, referentiel);
      done('La création de la mesure aurait dû lever une exception');
    } catch (e) {
      expect(e).to.be.a(ErreurStatutMesureInvalide);
      expect(e.message).to.equal('Le statut "statutInvalide" est invalide');
      done();
    }
  });
});
