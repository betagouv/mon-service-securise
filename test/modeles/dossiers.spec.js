const expect = require('expect.js');

const { ConstructeurDossierFantaisie } = require('../constructeurs/constructeurDossier');
const { ErreurDossiersInvalides } = require('../../src/erreurs');
const Dossier = require('../../src/modeles/dossier');
const Dossiers = require('../../src/modeles/dossiers');
const Referentiel = require('../../src/referentiel');

const ils = it;

describe('Les dossiers liés à un service', () => {
  const referentiel = Referentiel.creeReferentielVide();

  ils("exigent qu'il n'y ait qu'un seul dossier maximum non finalisé", (done) => {
    try {
      new Dossiers({ dossiers: [{ id: '1', finalise: true }, { id: '2' }, { id: '3' }] });
      done('La création des dossiers aurait dû lever une exception');
    } catch (e) {
      expect(e).to.be.an(ErreurDossiersInvalides);
      expect(e.message).to.equal("Les dossiers ne peuvent pas avoir plus d'un dossier non finalisé");
      done();
    }
  });

  ils('retournent comme dossier courant le dossier non finalisé', () => {
    const dossiers = new Dossiers({ dossiers: [{ id: '1', finalise: true }, { id: '2' }] });

    const dossierCourant = dossiers.dossierCourant();
    expect(dossierCourant).to.be.a(Dossier);
    expect(dossierCourant.id).to.equal('2');
  });

  ils('retournent comme dossiers finalisés ceux qui ne sont pas le dossier courant', () => {
    const dossiers = new Dossiers({ dossiers: [{ id: '1', finalise: true }, { id: '2' }] });

    const dossiersFinalises = dossiers.finalises();
    expect(dossiersFinalises.length).to.equal(1);
    expect(dossiersFinalises[0].id).to.equal('1');
  });

  describe('concernant le dossier actif', () => {
    const adaptateurHorloge = { maintenant: () => new Date(2023, 2, 1) };
    const unDossierComplet = (id) => new ConstructeurDossierFantaisie(id, referentiel)
      .quiEstComplet();

    beforeEach(() => (
      referentiel.recharge({
        echeancesRenouvellement: { unAn: { nbMoisDecalage: 12 } },
        statutsAvisDossierHomologation: { favorable: {} },
      })
    ));

    ils("retournent le premier dossier actif trouvé, sans se soucier des dates d'expiration", () => {
      const dossiers = new Dossiers({
        dossiers: [
          unDossierComplet('actif-depuis-10-jours').quiEstActif(10).donnees,
          unDossierComplet('actif-depuis-hier').quiEstActif(1).donnees,
        ],
      }, referentiel, adaptateurHorloge);

      const dossierActif = dossiers.dossierActif();
      expect(dossierActif.id).to.equal('actif-depuis-10-jours');
    });

    ils("retournent une valeur indéfinie si aucun dossier actif n'est trouvé", () => {
      const dossiers = new Dossiers({ dossiers: [{ id: '1' }] });

      const dossierActif = dossiers.dossierActif();
      expect(dossierActif).to.equal(undefined);
    });

    ils("considèrent que l'action de saisie est terminée s'il existe un dossier actif", () => {
      const dossiers = new Dossiers({
        dossiers: [unDossierComplet().quiEstActif().donnees],
      }, referentiel, adaptateurHorloge);

      expect(dossiers.statutSaisie()).to.equal(Dossiers.COMPLETES);
    });

    ils("considèrent que l'action de saisie est à compléter s'il n'existe pas de dossier actif", () => {
      const dossiers = new Dossiers({
        dossiers: [unDossierComplet().quiEstExpire().donnees],
      }, referentiel, adaptateurHorloge);

      expect(dossiers.statutSaisie()).to.equal(Dossiers.A_COMPLETER);
    });

    ils("considèrent que l'action de saisie est à saisir s'il n'existe pas de dossier", () => {
      const dossiers = new Dossiers();

      expect(dossiers.statutSaisie()).to.equal(Dossiers.A_SAISIR);
    });
  });
});
