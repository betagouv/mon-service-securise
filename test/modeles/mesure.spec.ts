import Mesure from '../../src/modeles/mesure.js';
import {
  ErreurEcheanceMesureInvalide,
  ErreurPrioriteMesureInvalide,
} from '../../src/erreurs.js';
import * as Referentiel from '../../src/referentiel.js';
import { creeReferentielVide } from '../../src/referentiel.js';

describe('Une mesure', () => {
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
    try {
      Mesure.valide({ statut: undefined }, creeReferentielVide());
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
      const referentiel = Referentiel.creeReferentielVide();
      referentiel.enrichis({ prioritesMesures: {} });

      expect(() =>
        Mesure.valide({ priorite: 'inconnue' }, referentiel)
      ).toThrowError(
        new ErreurPrioriteMesureInvalide('La priorité "inconnue" est invalide')
      );
    });

    it('valide la priorité si elle est dans le référentiel', () => {
      const referentiel = Referentiel.creeReferentielVide();
      referentiel.enrichis({
        prioritesMesures: { p1: { libelleCourt: '', libelleComplet: '' } },
      });

      Mesure.valide({ priorite: 'p1' }, referentiel);
    });
  });

  describe("sur validation de l'échéance", () => {
    it("ne valide pas si l'échéance n'est pas une date valide", () => {
      expect(() =>
        Mesure.valide(
          { echeance: 'pasunedate' },
          Referentiel.creeReferentielVide()
        )
      ).toThrowError(
        new ErreurEcheanceMesureInvalide(
          'L\'échéance "pasunedate" est invalide'
        )
      );
    });

    it("valide si l'échéance est une date valide", () => {
      Mesure.valide(
        { echeance: '08/25/2024' },
        Referentiel.creeReferentielVide()
      );
    });
  });
});
