import {
  ConstructeurDossierFantaisie,
  unDossier,
} from '../constructeurs/constructeurDossier.js';

import {
  ErreurDossiersInvalides,
  ErreurDossierNonFinalisable,
  ErreurDossierCourantInexistant,
} from '../../src/erreurs.js';

import Dossier from '../../src/modeles/dossier.js';
import Dossiers from '../../src/modeles/dossiers.js';
import { creeReferentielVide } from '../../src/referentiel.js';
import { UUID } from '../../src/typesBasiques.ts';
import { unUUID } from '../constructeurs/UUID.ts';

describe('Les dossiers liés à un service', () => {
  const referentiel = creeReferentielVide();
  const unDossierComplet = (id: UUID = unUUID('1')) =>
    new ConstructeurDossierFantaisie(id, referentiel).quiEstComplet();

  beforeEach(() =>
    referentiel.recharge({
      echeancesRenouvellement: {
        unAn: { nbMoisDecalage: 12, nbMoisBientotExpire: 1 },
      },
      statutsAvisDossierHomologation: { favorable: {} },
    })
  );

  it("exigent qu'il n'y ait qu'un seul dossier maximum non finalisé", async () => {
    expect(
      () =>
        new Dossiers({
          dossiers: [
            { id: unUUID('1'), finalise: true },
            { id: unUUID('2') },
            { id: unUUID('3') },
          ],
        })
    ).toThrowError(
      new ErreurDossiersInvalides(
        "Les dossiers ne peuvent pas avoir plus d'un dossier non finalisé"
      )
    );
  });

  it('retournent comme dossier courant le dossier non finalisé', () => {
    const dossiers = new Dossiers({
      dossiers: [{ id: unUUID('1'), finalise: true }, { id: unUUID('2') }],
    });

    const dossierCourant = dossiers.dossierCourant();

    expect(dossierCourant).toBeInstanceOf(Dossier);
    expect(dossierCourant.id).toEqual(unUUID('2'));
  });

  it('retournent comme dossiers finalisés ceux qui ne sont pas le dossier courant', () => {
    const dossiers = new Dossiers({
      dossiers: [{ id: unUUID('1'), finalise: true }, { id: unUUID('2') }],
    });

    const dossiersFinalises = dossiers.finalises();

    expect(dossiersFinalises.length).toEqual(1);
    expect(dossiersFinalises[0].id).toEqual(unUUID('1'));
  });

  describe('concernant le dossier actif', () => {
    it('retournent le dossier actif', () => {
      const dossiers = new Dossiers(
        { dossiers: [unDossierComplet(unUUID('1')).quiEstActif().donnees] },
        referentiel
      );

      const dossierActif = dossiers.dossierActif();

      expect(dossierActif.id).toEqual(unUUID('1'));
    });

    it("jettent une erreur s'il y a plusieurs dossiers actifs", () => {
      const dossiers = new Dossiers(
        {
          dossiers: [
            unDossierComplet(unUUID('1')).quiEstActif().donnees,
            unDossierComplet(unUUID('2')).quiEstActif().donnees,
          ],
        },
        referentiel
      );

      expect(() => dossiers.dossierActif()).toThrowError(
        new ErreurDossiersInvalides(
          "Les dossiers ne peuvent pas avoir plus d'un dossier actif"
        )
      );
    });

    it("retournent une valeur indéfinie si aucun dossier actif n'est trouvé", () => {
      const dossiers = new Dossiers({ dossiers: [{ id: unUUID('1') }] });

      const dossierActif = dossiers.dossierActif();

      expect(dossierActif).toEqual(undefined);
    });
  });

  describe("concernant le statut de l'action de saisie", () => {
    it("considèrent que l'action est « à saisir » s'il n'y a pas de dossier", () => {
      const sansDossiers = new Dossiers();

      expect(sansDossiers.statutSaisie()).toEqual(Dossiers.A_SAISIR);
    });

    it("considèrent que l'action est « à compléter » s'il y a un dossier courant", () => {
      const dossierCourant = unDossierComplet().quiEstNonFinalise().donnees;
      const dossiers = new Dossiers(
        { dossiers: [dossierCourant] },
        referentiel
      );

      expect(dossiers.statutSaisie()).toEqual(Dossiers.A_COMPLETER);
    });

    it("considèrent que l'action est « à compléter » s'il y a à la fois un dossier courant et un dossier actif", () => {
      const dossierCourant = unDossierComplet().quiEstNonFinalise().donnees;
      const dossierActif = unDossierComplet().quiEstActif().donnees;
      const dossiers = new Dossiers(
        { dossiers: [dossierActif, dossierCourant] },
        referentiel
      );

      expect(dossiers.statutSaisie()).toEqual(Dossiers.A_COMPLETER);
    });

    it("considèrent que l'action est « complète » s'il y a un dossier actif et en cours de validité", () => {
      const dossierActifEnCoursDeValidite =
        unDossierComplet().quiEstActif().donnees;
      const dossiers = new Dossiers(
        { dossiers: [dossierActifEnCoursDeValidite] },
        referentiel
      );

      expect(dossiers.statutSaisie()).toEqual(Dossiers.COMPLETES);
    });
  });

  describe("concernant le statut d'homologation", () => {
    it("retournent « Non réalisée » si il n'y a aucun dossier", () => {
      const aucunDossier = new Dossiers({ dossiers: [] });

      expect(aucunDossier.statutHomologation()).toEqual(Dossiers.NON_REALISEE);
    });

    it("retournent « Non réalisée » si il n'y a aucun dossier finalisé", () => {
      const aucunDossier = new Dossiers(
        { dossiers: [unDossierComplet().quiEstNonFinalise().donnees] },
        referentiel
      );

      expect(aucunDossier.statutHomologation()).toEqual(Dossiers.NON_REALISEE);
    });

    it('délèguent au dossier actif lorsque celui-ci existe', () => {
      const avecDossierActifBouchon = new Dossiers(
        { dossiers: [unDossierComplet().donnees] },
        referentiel
      );
      // @ts-expect-error On mock la fonction
      avecDossierActifBouchon.dossierActif = () => ({
        statutHomologation: () => Dossiers.EXPIREE,
      });

      const statut = avecDossierActifBouchon.statutHomologation();

      expect(statut).toBe(Dossiers.EXPIREE);
    });
  });

  describe('sur demande de finalisation du dossier courant', () => {
    it('finalise le dossier courant et archive les autres', () => {
      const deuxDossiers = new Dossiers(
        {
          dossiers: [
            unDossierComplet(unUUID('1')).donnees,
            unDossierComplet(unUUID('2')).quiEstNonFinalise().donnees,
          ],
        },
        referentiel
      );

      deuxDossiers.finaliseDossierCourant(3.5, 4.5);

      const [dossierAArchiver, dossierAFinaliser] = deuxDossiers.items;
      expect(dossierAArchiver.id).toEqual(unUUID('1'));
      expect(dossierAArchiver.archive).toBe(true);
      expect(dossierAFinaliser.id).toEqual(unUUID('2'));
      expect(dossierAFinaliser.archive).toBe(undefined);
      expect(dossierAFinaliser.finalise).toBe(true);
      expect(dossierAFinaliser.indiceCyber).toBe(3.5);
      expect(dossierAFinaliser.indiceCyberPersonnalise).toBe(4.5);
    });

    it("jette une erreur si aucun dossier courant n'existe", () => {
      const sansDossierCourant = new Dossiers(
        { dossiers: [unDossierComplet().donnees] },
        referentiel
      );

      expect(() =>
        sansDossierCourant.finaliseDossierCourant(0, 0)
      ).toThrowError(
        new ErreurDossierNonFinalisable('Aucun dossier courant à finaliser', [])
      );
    });
  });

  describe("sur demande de présence d'un dossier actif et en cours de validité", () => {
    it("retournent `false` s'il n'y a pas de dossier actif", () => {
      const dossiersSansDossierActif = new Dossiers(
        { dossiers: [unDossier(referentiel).quiEstNonFinalise().donnees] },
        referentiel
      );
      expect(dossiersSansDossierActif.aUnDossierEnCoursDeValidite()).toBe(
        false
      );
    });

    it("retournent `false` si le dossier actif n'est pas en cours de validité", () => {
      const dossiersAvecDossierActifExpire = new Dossiers(
        {
          dossiers: [
            unDossier(referentiel).quiEstComplet().quiEstExpire().donnees,
          ],
        },
        referentiel
      );
      expect(dossiersAvecDossierActifExpire.aUnDossierEnCoursDeValidite()).toBe(
        false
      );
    });

    it('retournent `true` si le dossier actif est en cours de validité', () => {
      const dossiersAvecDossierActifExpire = new Dossiers(
        {
          dossiers: [
            unDossier(referentiel).quiEstComplet().quiEstActif().donnees,
          ],
        },
        referentiel
      );
      expect(dossiersAvecDossierActifExpire.aUnDossierEnCoursDeValidite()).toBe(
        true
      );
    });

    it('retournent `true` si le dossier actif est bientôt expiré', () => {
      const dossiersAvecDossierActifExpire = new Dossiers(
        {
          dossiers: [
            unDossier(referentiel)
              .quiEstComplet()
              .quiEstActif()
              .quiVaExpirer(1, 'unAn').donnees,
          ],
        },
        referentiel
      );
      expect(dossiersAvecDossierActifExpire.aUnDossierEnCoursDeValidite()).toBe(
        true
      );
    });
  });

  describe('sur demande des dossiers archivés', () => {
    it('retournent seulement les dossiers avec la propriété `archive` valant `true`', () => {
      const dossiers = new Dossiers(
        {
          dossiers: [
            unDossier(referentiel)
              .avecId(unUUID('a'))
              .quiEstComplet()
              .quiEstArchive().donnees,
            unDossier(referentiel).avecId(unUUID('c')).quiEstComplet().donnees,
            unDossier(referentiel)
              .avecId(unUUID('f'))
              .quiEstComplet()
              .quiEstNonFinalise().donnees,
          ],
        },
        referentiel
      );

      const archives = dossiers.archives();
      expect(archives.length).toBe(1);
      expect(archives[0].id).toBe(unUUID('a'));
    });

    it("retournent les dossiers archives dans l'ordre décroissant des dates d'échéances", () => {
      const dossiers = new Dossiers(
        {
          dossiers: [
            unDossier(referentiel)
              .avecId(unUUID('d'))
              .quiEstComplet()
              .avecDecision('01/01/2023', 'unAn')
              .quiEstArchive().donnees,
            unDossier(referentiel)
              .avecId(unUUID('p'))
              .quiEstComplet()
              .avecDecision('01/01/2024', 'unAn')
              .quiEstArchive().donnees,
          ],
        },
        referentiel
      );

      const archives = dossiers.archives();
      expect(archives[0].id).toBe(unUUID('p'));
      expect(archives[1].id).toBe(unUUID('d'));
    });
  });

  describe('sur demande de suppression du dossier courant', () => {
    it('suppriment le dossier courant', () => {
      const dossiers = new Dossiers(
        {
          dossiers: [
            unDossierComplet(unUUID('1')).donnees,
            unDossierComplet(unUUID('2')).quiEstNonFinalise().donnees,
          ],
        },
        referentiel
      );

      dossiers.supprimeDossierCourant();

      expect(dossiers.nombre()).toBe(1);
      expect(dossiers.items[0].id).toBe(unUUID('1'));
    });

    it("jettent une erreur s'il n'y a pas de dossier courant", () => {
      const sansDossierCourant = new Dossiers({ dossiers: [] }, referentiel);

      expect(() => sansDossierCourant.supprimeDossierCourant()).toThrowError(
        new ErreurDossierCourantInexistant(
          'Les dossiers ne comportent pas de dossier courant'
        )
      );
    });
  });
});
