import { creeFileMisesAJour } from '../../../lib/ui/stores/fileMisesAJour.store';
import { expect } from 'vitest';
import { get } from 'svelte/store';

describe('La file de mises à jour', () => {
  const unePromesse = <T = void>() => {
    let termine!: (valeur: T) => void;
    let echoue!: (valeur: T) => void;
    const promesse = new Promise<T>((resolve, reject) => {
      termine = resolve;
      echoue = reject;
    });

    const controle = {
      aDemarre: false,
      tache: () => {
        controle.aDemarre = true;
        return promesse;
      },
      termine,
      echoue,
    };
    return controle;
  };

  const laissePasserLesPromesses = () =>
    new Promise((resolve) => setTimeout(resolve, 0));

  it('résout les promesses séquentiellement', async () => {
    const p1 = unePromesse();
    const p2 = unePromesse();
    const file = creeFileMisesAJour();

    file.ajoute(p1.tache);
    file.ajoute(p2.tache);
    await laissePasserLesPromesses();
    expect(p1.aDemarre).toBe(true);
    expect(p2.aDemarre).toBe(false);

    p1.termine();
    await laissePasserLesPromesses();
    expect(p1.aDemarre).toBe(true);
    expect(p2.aDemarre).toBe(true);
  });

  it("indique l'état en cours tant qu'il reste des promesses non résolues", async () => {
    const p1 = unePromesse();
    const file = creeFileMisesAJour();

    file.ajoute(p1.tache);
    await laissePasserLesPromesses();
    expect(get(file.enCours)).toBe(true);

    p1.termine();
    await laissePasserLesPromesses();
    expect(get(file.enCours)).toBe(false);
  });

  it("peut appeler une callback en cas d'erreur", async () => {
    let callbackAppelee = false;
    const p1 = unePromesse();
    const file = creeFileMisesAJour(() => {
      callbackAppelee = true;
    });

    file.ajoute(p1.tache);
    await laissePasserLesPromesses();
    expect(callbackAppelee).toBe(false);

    p1.echoue();
    await laissePasserLesPromesses();
    expect(callbackAppelee).toBe(true);
  });
});
