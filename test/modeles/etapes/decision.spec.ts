import Decision from '../../../src/modeles/etapes/decision.js';
import {
  ErreurDateHomologationInvalide,
  ErreurDureeValiditeInvalide,
} from '../../../src/erreurs.js';
import { creeReferentielVide } from '../../../src/referentiel.js';

describe('Une étape « Décision »', () => {
  const referentiel = creeReferentielVide();

  beforeEach(() =>
    referentiel.recharge({ echeancesRenouvellement: { unAn: {} } })
  );

  it('sait se convertir en JSON', () => {
    const decision = new Decision(
      { dateHomologation: '2022-12-01', dureeValidite: 'unAn' },
      referentiel
    );

    expect(decision.toJSON()).toEqual({
      dateHomologation: '2022-12-01',
      dureeValidite: 'unAn',
    });
  });

  it('valide la valeur passée pour la durée de validité', () => {
    expect(() => new Decision({ dureeValidite: 'dureeInvalide' })).toThrowError(
      new ErreurDureeValiditeInvalide(
        'La durée de validité "dureeInvalide" est invalide'
      )
    );
  });

  it("valide la valeur passée pour la date d'homologation", () => {
    expect(() => new Decision({ dateHomologation: '2022-13-01' })).toThrowError(
      new ErreurDateHomologationInvalide('La date "2022-13-01" est invalide')
    );
  });

  it("ne lève pas d'exception si la durée de validité ou la date d'homologation ne sont pas renseignées", () => {
    expect(() => new Decision()).not.toThrowError();
  });

  describe('sur demande de la description de la durée de validité', () => {
    it('retourne la description provenant du référentiel', () => {
      referentiel.recharge({
        echeancesRenouvellement: { unAn: { description: '1 an' } },
      });
      const decision = new Decision({ dureeValidite: 'unAn' }, referentiel);
      expect(decision.descriptionDureeValidite()).toEqual('1 an');
    });

    it("retourne une chaîne vide si la durée de validité n'est pas renseignée", () => {
      const decision = new Decision();
      expect(decision.descriptionDureeValidite()).toEqual('');
    });
  });

  it("présente la date d'homologation localisée en français", () => {
    const decision = new Decision({ dateHomologation: '2022-11-27' });
    expect(decision.descriptionDateHomologation()).toEqual('27/11/2022');
  });

  it("présente une chaîne vide s'il n'y a pas de date d'homologation renseignée", () => {
    const decision = new Decision();
    expect(decision.descriptionDateHomologation()).toEqual('');
  });

  describe('sur demande de la date de prochaine homologation', () => {
    beforeEach(() =>
      referentiel.recharge({
        echeancesRenouvellement: { unAn: { nbMoisDecalage: 12 } },
      })
    );

    it('retourne la date localisée en français', () => {
      const decision = new Decision(
        { dateHomologation: '2022-11-27', dureeValidite: 'unAn' },
        referentiel
      );
      expect(decision.descriptionProchaineDateHomologation()).toEqual(
        '27/11/2023'
      );
    });

    it("retourne une chaîne vide si la date n'est renseignée", () => {
      const decision = new Decision({ dureeValidite: 'unAn' }, referentiel);
      expect(decision.descriptionProchaineDateHomologation()).toEqual('');
    });

    it("retourne une chaîne vide si la durée de validité n'est pas renseignée", () => {
      const decision = new Decision({ dateHomologation: '2022-11-27' });
      expect(decision.descriptionProchaineDateHomologation()).toEqual('');
    });
  });

  describe("sur vérification que l'étape « Décision » est complète", () => {
    it("retourne `false` s'il manque la durée de validité", () => {
      const decisionIncomplete = new Decision({
        dateHomologation: '2022-11-27',
      });
      expect(decisionIncomplete.estComplete()).toBe(false);
    });

    it("retourne `false` s'il manque la date d'homologation", () => {
      referentiel.recharge({ echeancesRenouvellement: { unAn: {} } });
      const decisionIncomplete = new Decision(
        { dureeValidite: 'unAn' },
        referentiel
      );
      expect(decisionIncomplete.estComplete()).toBe(false);
    });

    it("retourne `true` s'il ne manque rien", () => {
      referentiel.recharge({ echeancesRenouvellement: { unAn: {} } });
      const decisionIncomplete = new Decision(
        { dateHomologation: '2022-11-27', dureeValidite: 'unAn' },
        referentiel
      );
      expect(decisionIncomplete.estComplete()).toBe(true);
    });
  });
});
