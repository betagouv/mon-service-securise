const expect = require('expect.js');

const {
  ConstructeurDossierFantaisie,
} = require('../constructeurs/constructeurDossier');
const {
  ErreurDossiersInvalides,
  ErreurDossierNonFinalisable,
} = require('../../src/erreurs');
const Dossier = require('../../src/modeles/dossier');
const Dossiers = require('../../src/modeles/dossiers');
const Referentiel = require('../../src/referentiel');

describe('Les dossiers liés à un service', () => {
  const referentiel = Referentiel.creeReferentielVide();
  const unDossierComplet = (id) =>
    new ConstructeurDossierFantaisie(id, referentiel).quiEstComplet();

  beforeEach(() =>
    referentiel.recharge({
      echeancesRenouvellement: { unAn: { nbMoisDecalage: 12 } },
      statutsAvisDossierHomologation: { favorable: {} },
    })
  );

  it("exigent qu'il n'y ait qu'un seul dossier maximum non finalisé", async () => {
    expect(() => {
      new Dossiers({
        dossiers: [{ id: '1', finalise: true }, { id: '2' }, { id: '3' }],
      });
    }).to.throwError((e) => {
      expect(e).to.be.an(ErreurDossiersInvalides);
      expect(e.message).to.equal(
        "Les dossiers ne peuvent pas avoir plus d'un dossier non finalisé"
      );
    });
  });

  it('retournent comme dossier courant le dossier non finalisé', () => {
    const dossiers = new Dossiers({
      dossiers: [{ id: '1', finalise: true }, { id: '2' }],
    });

    const dossierCourant = dossiers.dossierCourant();

    expect(dossierCourant).to.be.a(Dossier);
    expect(dossierCourant.id).to.equal('2');
  });

  it('retournent comme dossiers finalisés ceux qui ne sont pas le dossier courant', () => {
    const dossiers = new Dossiers({
      dossiers: [{ id: '1', finalise: true }, { id: '2' }],
    });

    const dossiersFinalises = dossiers.finalises();

    expect(dossiersFinalises.length).to.equal(1);
    expect(dossiersFinalises[0].id).to.equal('1');
  });

  describe('concernant le dossier actif', () => {
    it('retournent le dossier actif', () => {
      const dossiers = new Dossiers(
        { dossiers: [unDossierComplet('actif').quiEstActif().donnees] },
        referentiel
      );

      const dossierActif = dossiers.dossierActif();

      expect(dossierActif.id).to.equal('actif');
    });

    it("jettent une erreur s'il y a plusieurs dossiers actifs", () => {
      const dossiers = new Dossiers(
        {
          dossiers: [
            unDossierComplet('actif').quiEstActif().donnees,
            unDossierComplet('actif-second').quiEstActif().donnees,
          ],
        },
        referentiel
      );

      expect(() => dossiers.dossierActif()).to.throwError((e) => {
        expect(e).to.be.an(ErreurDossiersInvalides);
        expect(e.message).to.equal(
          "Les dossiers ne peuvent pas avoir plus d'un dossier actif"
        );
      });
    });

    it("retournent une valeur indéfinie si aucun dossier actif n'est trouvé", () => {
      const dossiers = new Dossiers({ dossiers: [{ id: '1' }] });

      const dossierActif = dossiers.dossierActif();

      expect(dossierActif).to.equal(undefined);
    });
  });

  describe("concernant le statut de l'action de saisie", () => {
    it("considèrent que l'action est « à saisir » s'il n'y a pas de dossier", () => {
      const sansDossiers = new Dossiers();

      expect(sansDossiers.statutSaisie()).to.equal(Dossiers.A_SAISIR);
    });

    it("considèrent que l'action est « à compléter » s'il y a un dossier courant", () => {
      const dossierCourant = unDossierComplet().quiEstNonFinalise().donnees;
      const dossiers = new Dossiers(
        { dossiers: [dossierCourant] },
        referentiel
      );

      expect(dossiers.statutSaisie()).to.equal(Dossiers.A_COMPLETER);
    });

    it("considèrent que l'action est « à compléter » s'il y a à la fois un dossier courant et un dossier actif", () => {
      const dossierCourant = unDossierComplet().quiEstNonFinalise().donnees;
      const dossierActif = unDossierComplet().quiEstActif().donnees;
      const dossiers = new Dossiers(
        { dossiers: [dossierActif, dossierCourant] },
        referentiel
      );

      expect(dossiers.statutSaisie()).to.equal(Dossiers.A_COMPLETER);
    });
  });

  describe("concernant le statut d'homologation", () => {
    it("retournent « Non réalisée » si il n'y a aucun dossier", () => {
      const aucunDossier = new Dossiers({ dossiers: [] });

      expect(aucunDossier.statutHomologation()).to.equal(Dossiers.NON_REALISEE);
    });

    it("retournent « Non réalisée » si il n'y a aucun dossier finalisé", () => {
      const aucunDossier = new Dossiers(
        { dossiers: [unDossierComplet().quiEstNonFinalise().donnees] },
        referentiel
      );

      expect(aucunDossier.statutHomologation()).to.equal(Dossiers.NON_REALISEE);
    });

    it('délèguent au dossier actif lorsque celui-ci existe', () => {
      const avecDossierActifBouchon = new Dossiers(
        { dossiers: [unDossierComplet().donnees] },
        referentiel
      );
      avecDossierActifBouchon.dossierActif = () => ({
        statutHomologation: () => Dossiers.EXPIREE,
      });

      const statut = avecDossierActifBouchon.statutHomologation();

      expect(statut).to.be(Dossiers.EXPIREE);
    });
  });

  describe('sur demande de finalisation du dossier courant', () => {
    it('finalise le dossier courant et archive les autres', () => {
      const deuxDossiers = new Dossiers(
        {
          dossiers: [
            unDossierComplet('dossier à archiver').donnees,
            unDossierComplet('dossier à finaliser').quiEstNonFinalise().donnees,
          ],
        },
        referentiel
      );

      deuxDossiers.finaliseDossierCourant();

      const [dossierAArchiver, dossierAFinaliser] = deuxDossiers.items;
      expect(dossierAArchiver.id).to.equal('dossier à archiver');
      expect(dossierAArchiver.archive).to.be(true);
      expect(dossierAFinaliser.id).to.equal('dossier à finaliser');
      expect(dossierAFinaliser.archive).to.be(undefined);
      expect(dossierAFinaliser.finalise).to.be(true);
    });

    it("jette une erreur si aucun dossier courant n'existe", () => {
      const sansDossierCourant = new Dossiers(
        { dossiers: [unDossierComplet().donnees] },
        referentiel
      );

      expect(() => sansDossierCourant.finaliseDossierCourant()).to.throwError(
        (e) => {
          expect(e).to.be.an(ErreurDossierNonFinalisable);
          expect(e.message).to.equal('Aucun dossier courant à finaliser');
        }
      );
    });
  });
});
