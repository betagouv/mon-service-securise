import Decision from '../../../src/modeles/etapes/decision.js';
import {
  ErreurDateHomologationInvalide,
  ErreurDecisionInvalide,
  ErreurDureeValiditeInvalide,
} from '../../../src/erreurs.js';
import { creeReferentielVide } from '../../../src/referentiel.js';

describe('Une étape « Décision »', () => {
  const referentiel = creeReferentielVide();

  beforeEach(() =>
    referentiel.recharge({
      echeancesRenouvellement: {
        // @ts-expect-error on utilise un référentiel partiel
        unAn: {
          description: '1 an',
          nbMoisDecalage: 12,
        },
      },
    })
  );

  describe('sur demande de conversion en JSON', () => {
    it('sait se convertir avec une durée de validité', () => {
      const decision = new Decision(
        { dateHomologation: '2022-12-01', dureeValidite: 'unAn' },
        referentiel
      );

      expect(decision.toJSON()).toEqual({
        dateHomologation: '2022-12-01',
        dureeValidite: 'unAn',
      });
    });
    it('sait se convertir pour une homologation refusée', () => {
      const decision = new Decision(
        { dateHomologation: '2022-12-01', refusee: true },
        referentiel
      );

      expect(decision.toJSON()).toEqual({
        dateHomologation: '2022-12-01',
        refusee: true,
      });
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

  it("n'accepte refusee que si la durée de validité n'est pas renseignée", () => {
    expect(
      () =>
        new Decision({
          dateHomologation: '2022-13-01',
          refusee: true,
          dureeValidite: 'unAn',
        })
    ).toThrowError(
      new ErreurDecisionInvalide(
        'Un dossier refusé ne peut pas avoir de durée de validité.'
      )
    );
  });

  it("ne lève pas d'exception si la durée de validité ou la date d'homologation ne sont pas renseignées", () => {
    expect(() => new Decision()).not.toThrowError();
  });

  describe('sur demande de la description de la durée de validité', () => {
    it('retourne la description provenant du référentiel', () => {
      const decision = new Decision({ dureeValidite: 'unAn' }, referentiel);
      expect(decision.descriptionDureeValidite()).toEqual('1 an');
    });

    it("retourne une chaîne vide si la durée de validité n'est pas renseignée", () => {
      const decision = new Decision();
      expect(decision.descriptionDureeValidite()).toEqual('');
    });

    it('retourne une chaîne vide si la decision est refusée', () => {
      const decision = new Decision({ refusee: true });
      expect(decision.descriptionDureeValidite()).toEqual('');
    });
  });

  describe("sur demande de la date d'homologation", () => {
    it("présente la date d'homologation localisée en français", () => {
      const decision = new Decision({ dateHomologation: '2022-11-27' });
      expect(decision.descriptionDateHomologation()).toEqual('27/11/2022');
    });

    it("présente une chaîne vide s'il n'y a pas de date d'homologation renseignée", () => {
      const decision = new Decision();
      expect(decision.descriptionDateHomologation()).toEqual('');
    });
  });

  describe('sur demande de la description de la date de prochaine homologation', () => {
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

    it("retourne la date d'homologation si la décision est refusée", () => {
      const decision = new Decision(
        { dateHomologation: '2022-11-27', refusee: true },
        referentiel
      );
      expect(decision.descriptionProchaineDateHomologation()).toEqual(
        '27/11/2022'
      );
    });
  });

  describe('sur demande de la date de prochaine homologation', () => {
    it("retourne la date d'homologation si la décision est refusée", () => {
      const decision = new Decision(
        { dateHomologation: '2022-11-27', refusee: true },
        referentiel
      );
      expect(decision.dateProchaineHomologation()).toEqual(
        new Date('2022-11-27')
      );
    });

    it('retourne la date décalée de la durée de validité', () => {
      const decision = new Decision(
        { dateHomologation: '2022-11-27', dureeValidite: 'unAn' },
        referentiel
      );
      expect(decision.dateProchaineHomologation()).toEqual(
        new Date('2023-11-27')
      );
    });
  });

  describe("sur vérification que l'étape « Décision » est complète", () => {
    it("retourne `false` s'il manque la durée de validité et que la décision n'est pas refusée", () => {
      const decisionIncomplete = new Decision({
        dateHomologation: '2022-11-27',
      });
      expect(decisionIncomplete.estComplete()).toBe(false);
    });

    it("retourne `false` s'il manque la date d'homologation", () => {
      const decisionIncomplete = new Decision(
        { dureeValidite: 'unAn' },
        referentiel
      );
      expect(decisionIncomplete.estComplete()).toBe(false);
    });

    it("retourne `true` s'il ne manque rien pour une décision acceptée", () => {
      const decisionIncomplete = new Decision(
        { dateHomologation: '2022-11-27', dureeValidite: 'unAn' },
        referentiel
      );
      expect(decisionIncomplete.estComplete()).toBe(true);
    });

    it("retourne `true` s'il ne manque rien pour une décision refusée", () => {
      const decisionIncomplete = new Decision(
        { dateHomologation: '2022-11-27', refusee: true },
        referentiel
      );
      expect(decisionIncomplete.estComplete()).toBe(true);
    });
  });
});
