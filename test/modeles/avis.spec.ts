import {
  ErreurDureeValiditeInvalide,
  ErreurAvisInvalide,
} from '../../src/erreurs.js';
import Avis from '../../src/modeles/avis.js';
import InformationsService from '../../src/modeles/informationsService.js';
import { creeReferentielVide } from '../../src/referentiel.js';

describe("Un avis sur un dossier d'homologation", () => {
  const referentiel = creeReferentielVide();
  referentiel.recharge({
    statutsAvisDossierHomologation: { favorable: {} },
    echeancesRenouvellement: { unAn: {} },
  });

  it('est complet si toutes les informations sont remplies', () => {
    const avis = new Avis(
      {
        statut: 'favorable',
        dureeValidite: 'unAn',
        collaborateurs: ['Jean Dupond'],
      },
      referentiel
    );

    expect(avis.statutSaisie()).toBe(InformationsService.COMPLETES);
  });

  it("est incomplet si la liste des collaborateurs n'est pas remplie", () => {
    const verifieAvecCollaborateurs = (collaborateurs: unknown) => {
      const avis = new Avis(
        // @ts-expect-error On force une valeur invalide
        { statut: 'favorable', dureeValidite: 'unAn', collaborateurs },
        referentiel
      );
      expect(avis.statutSaisie()).toBe(InformationsService.A_COMPLETER);
    };

    verifieAvecCollaborateurs([null]);
    verifieAvecCollaborateurs(['']);
    verifieAvecCollaborateurs([]);
    verifieAvecCollaborateurs([undefined]);
    verifieAvecCollaborateurs(undefined);
  });

  it('est invalide si la durée de validité est inconnue dans le référentiel', () => {
    expect(
      // @ts-expect-error on test sciemment une donnée fausse
      () => new Avis({ dureeValidite: 'dureeInvalide' }, referentiel)
    ).toThrow(ErreurDureeValiditeInvalide);
  });

  it('est invalide si le statut de validité est inconnu dans le référentiel', () => {
    expect(
      () =>
        new Avis(
          // @ts-expect-error on test sciemment une donnée fausse
          { dureeValidite: 'unAn', statut: 'statutInvalide' },
          referentiel
        )
    ).toThrow(ErreurAvisInvalide);
  });

  it('connaît les noms des collaborateurs ayant renseigné l’avis', () => {
    const avis = new Avis(
      {
        statut: 'favorable',
        dureeValidite: 'unAn',
        collaborateurs: ['Jean Dupond', 'Marie Martin'],
      },
      referentiel
    );

    expect(avis.nomsCollaborateurs()).toEqual(['Jean Dupond', 'Marie Martin']);
  });
});
