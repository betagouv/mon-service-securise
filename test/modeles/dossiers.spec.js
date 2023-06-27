const expect = require('expect.js');

const {
  ConstructeurDossierFantaisie,
} = require('../constructeurs/constructeurDossier');
const { ErreurDossiersInvalides } = require('../../src/erreurs');
const Dossier = require('../../src/modeles/dossier');
const Dossiers = require('../../src/modeles/dossiers');
const Referentiel = require('../../src/referentiel');

const ils = it;

describe('Les dossiers liés à un service', () => {
  const referentiel = Referentiel.creeReferentielVide();
  const adaptateurHorloge = { maintenant: () => new Date(2023, 2, 1) };
  const unDossierComplet = (id) =>
    new ConstructeurDossierFantaisie(id, referentiel).quiEstComplet();

  beforeEach(() =>
    referentiel.recharge({
      echeancesRenouvellement: { unAn: { nbMoisDecalage: 12 } },
      statutsAvisDossierHomologation: { favorable: {} },
    })
  );

  ils(
    "exigent qu'il n'y ait qu'un seul dossier maximum non finalisé",
    (done) => {
      try {
        new Dossiers({
          dossiers: [{ id: '1', finalise: true }, { id: '2' }, { id: '3' }],
        });
        done('La création des dossiers aurait dû lever une exception');
      } catch (e) {
        expect(e).to.be.an(ErreurDossiersInvalides);
        expect(e.message).to.equal(
          "Les dossiers ne peuvent pas avoir plus d'un dossier non finalisé"
        );
        done();
      }
    }
  );

  ils('retournent comme dossier courant le dossier non finalisé', () => {
    const dossiers = new Dossiers({
      dossiers: [{ id: '1', finalise: true }, { id: '2' }],
    });

    const dossierCourant = dossiers.dossierCourant();
    expect(dossierCourant).to.be.a(Dossier);
    expect(dossierCourant.id).to.equal('2');
  });

  ils(
    'retournent comme dossiers finalisés ceux qui ne sont pas le dossier courant',
    () => {
      const dossiers = new Dossiers({
        dossiers: [{ id: '1', finalise: true }, { id: '2' }],
      });

      const dossiersFinalises = dossiers.finalises();
      expect(dossiersFinalises.length).to.equal(1);
      expect(dossiersFinalises[0].id).to.equal('1');
    }
  );

  describe('concernant le dossier actif', () => {
    ils('retournent le dossier actif', () => {
      const dossiers = new Dossiers(
        {
          dossiers: [unDossierComplet('actif').quiEstActif().donnees],
        },
        referentiel,
        adaptateurHorloge
      );

      const dossierActif = dossiers.dossierActif();
      expect(dossierActif.id).to.equal('actif');
    });

    ils("jettent une erreur s'il y a plusieurs dossiers actifs", () => {
      const dossiers = new Dossiers(
        {
          dossiers: [
            unDossierComplet('actif').quiEstActif().donnees,
            unDossierComplet('actif-second').quiEstActif().donnees,
          ],
        },
        referentiel,
        adaptateurHorloge
      );

      expect(() => dossiers.dossierActif()).to.throwError((e) => {
        expect(e).to.be.an(ErreurDossiersInvalides);
        expect(e.message).to.equal(
          "Les dossiers ne peuvent pas avoir plus d'un dossier actif"
        );
      });
    });

    ils(
      "retournent une valeur indéfinie si aucun dossier actif n'est trouvé",
      () => {
        const dossiers = new Dossiers({ dossiers: [{ id: '1' }] });

        const dossierActif = dossiers.dossierActif();
        expect(dossierActif).to.equal(undefined);
      }
    );

    ils(
      "considèrent que l'action de saisie est terminée s'il existe un dossier actif",
      () => {
        const dossiers = new Dossiers(
          {
            dossiers: [unDossierComplet().quiEstActif().donnees],
          },
          referentiel,
          adaptateurHorloge
        );

        expect(dossiers.statutSaisie()).to.equal(Dossiers.COMPLETES);
      }
    );

    ils(
      "considèrent que l'action de saisie est à compléter s'il n'existe pas de dossier actif",
      () => {
        const dossiers = new Dossiers(
          {
            dossiers: [unDossierComplet().quiEstExpire().donnees],
          },
          referentiel,
          adaptateurHorloge
        );

        expect(dossiers.statutSaisie()).to.equal(Dossiers.A_COMPLETER);
      }
    );

    ils(
      "considèrent que l'action de saisie est à saisir s'il n'existe pas de dossier",
      () => {
        const dossiers = new Dossiers();

        expect(dossiers.statutSaisie()).to.equal(Dossiers.A_SAISIR);
      }
    );
  });

  describe("concernant le statut d'homologation", () => {
    ils("retournent « À réaliser » si il n'y a aucun dossier", () => {
      const aucunDossiers = new Dossiers({ dossiers: [] });
      expect(aucunDossiers.statutHomologation()).to.equal(Dossiers.A_REALISER);
    });

    ils('retournent « À finaliser » si un dossier est en cours', () => {
      const dossierEnCours = new Dossiers({ dossiers: [{ id: '1' }] });
      expect(dossierEnCours.statutHomologation()).to.equal(
        Dossiers.A_FINALISER
      );
    });

    ils('retournent « Réalisée » si un dossier est actif', () => {
      const dossierActif = new Dossiers(
        {
          dossiers: [unDossierComplet().quiEstActif(1).donnees],
        },
        referentiel,
        adaptateurHorloge
      );

      expect(dossierActif.statutHomologation()).to.equal(Dossiers.REALISEE);
    });

    ils(
      'retournent « Bientôt expirée » si le dossier actif est bientôt expiré',
      () => {
        referentiel.recharge({
          echeancesRenouvellement: {
            sixMois: { nbMoisDecalage: 6, nbMoisBientotExpire: 2 },
          },
          statutsAvisDossierHomologation: { favorable: {} },
        });
        const dossierExpirantDans30Jours = new Dossiers(
          {
            dossiers: [unDossierComplet().quiVaExpirer(30, 'sixMois').donnees],
          },
          referentiel,
          adaptateurHorloge
        );

        expect(dossierExpirantDans30Jours.statutHomologation()).to.equal(
          Dossiers.BIENTOT_EXPIREE
        );
      }
    );

    ils('retournent « Expirée » si un dossier est expiré', () => {
      const dossierExpire = new Dossiers(
        {
          dossiers: [unDossierComplet().quiEstExpire().donnees],
        },
        referentiel,
        adaptateurHorloge
      );

      expect(dossierExpire.statutHomologation()).to.equal(Dossiers.EXPIREE);
    });

    ils(
      'retournent « À réaliser » dans le cas par défaut, par exemple si la seule homologation présente ne sera valide que dans le futur',
      () => {
        const dossierValideDansLeFutur = new Dossiers(
          {
            dossiers: [unDossierComplet().quiSeraActif(30).donnees],
          },
          referentiel,
          adaptateurHorloge
        );

        expect(dossierValideDansLeFutur.statutHomologation()).to.equal(
          Dossiers.A_REALISER
        );
      }
    );
  });
});
