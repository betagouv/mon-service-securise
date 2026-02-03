import Mesure from '../../src/modeles/mesure.js';
import {
  ErreurEcheanceMesureInvalide,
  ErreurPrioriteMesureInvalide,
} from '../../src/erreurs.js';
import { creeReferentielVide } from '../../src/referentiel.js';
import { Referentiel } from '../../src/referentiel.interface.ts';

describe('Une mesure', () => {
  let referentiel: Referentiel;

  beforeEach(() => {
    referentiel = creeReferentielVide();
  });

  describe('sur demande des statuts possibles', () => {
    it('retourne les statuts avec `fait` en premier par défaut', () => {
      expect(Mesure.statutsPossibles()).toEqual([
        'fait',
        'enCours',
        'nonFait',
        'aLancer',
      ]);
    });

    it('peut retourner les statuts avec `fait` en dernier si on le spécifie', () => {
      const statutFaitALaFin = true;
      expect(Mesure.statutsPossibles(statutFaitALaFin)).toEqual([
        'enCours',
        'nonFait',
        'aLancer',
        'fait',
      ]);
    });
  });

  it("ne tient pas compte du statut s'il n'est pas renseigné", () => {
    referentiel.enrichis({
      prioritesMesures: { p1: {} },
    });

    try {
      Mesure.valide(
        {
          statut: undefined,
          echeance: '01/01/2026',
          priorite: 'p1',
        },
        referentiel
      );
    } catch {
      expect.fail(
        "La validation de la mesure sans statut n'aurait pas dû lever d'exception."
      );
    }
  });

  describe('sur une interrogation de statut renseigné', () => {
    it('répond favorablement quand le statut est dans les statuts concernés', () => {
      expect(Mesure.statutRenseigne('fait')).toBe(true);
    });

    it("répond défavorablement quand le statut n'est pas renseigné", () => {
      expect(Mesure.statutRenseigne()).toBe(false);
    });
  });

  describe('sur validation de la priorite', () => {
    it("ne valide pas si la priorité n'est pas dans le référentiel", () => {
      referentiel.enrichis({ prioritesMesures: {} });

      expect(() =>
        Mesure.valide(
          // @ts-expect-error On force une valeur invalide
          { priorite: 'inconnue', statut: 'fait', echeance: '01/01/2026' },
          referentiel
        )
      ).toThrowError(
        new ErreurPrioriteMesureInvalide('La priorité "inconnue" est invalide')
      );
    });

    it('valide la priorité si elle est dans le référentiel', () => {
      referentiel.enrichis({
        prioritesMesures: { p1: {} },
      });

      Mesure.valide(
        { priorite: 'p1', statut: 'fait', echeance: '01/01/2026' },
        referentiel
      );
    });
  });

  describe("sur validation de l'échéance", () => {
    it("ne valide pas si l'échéance n'est pas une date valide", () => {
      referentiel.enrichis({
        prioritesMesures: { p1: {} },
      });

      expect(() =>
        Mesure.valide(
          { echeance: 'pasunedate', statut: 'fait', priorite: 'p1' },
          referentiel
        )
      ).toThrowError(
        new ErreurEcheanceMesureInvalide(
          'L\'échéance "pasunedate" est invalide'
        )
      );
    });

    it("valide si l'échéance est une date valide", () => {
      referentiel.enrichis({
        prioritesMesures: { p1: {} },
      });

      Mesure.valide(
        { echeance: '08/25/2024', statut: 'fait', priorite: 'p1' },
        referentiel
      );
    });
  });
});
