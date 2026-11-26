import {
  ErreurFichierInvalide,
  lisLignesDeFeuille,
} from '../../../lib/ui/televersement/lecteurExcel';
import { unClasseur } from './classeurDeTest';

describe('Le lecteur Excel', () => {
  const optionsDeLecture = {
    nomFeuille: 'Ma feuille',
    indexLigneEnTete: 2,
    colonnesAttendues: ['Nom', 'Prénom'],
    nombreMaximumDeLignes: 2,
  };

  it("retourne les lignes situées sous la ligne d'en-tête", async () => {
    const contenu = unClasseur({
      'Ma feuille': [
        ['Un titre'],
        ['Nom', 'Prénom'],
        ['Dupont', 'Jeanne'],
        ['Martin', 'Paul'],
      ],
    });

    const lignes = await lisLignesDeFeuille(contenu, optionsDeLecture);

    expect(lignes).toEqual([
      { Nom: 'Dupont', Prénom: 'Jeanne' },
      { Nom: 'Martin', Prénom: 'Paul' },
    ]);
  });

  it('retourne les cellules sous forme de chaînes de caractères', async () => {
    const contenu = unClasseur({
      'Ma feuille': [['Un titre'], ['Nom', 'Prénom'], [12, 'Jeanne']],
    });

    const lignes = await lisLignesDeFeuille(contenu, optionsDeLecture);

    expect(lignes[0].Nom).toBe('12');
  });

  it('remplace les cellules vides par une chaîne vide', async () => {
    const contenu = unClasseur({
      'Ma feuille': [['Un titre'], ['Nom', 'Prénom'], ['Dupont']],
    });

    const lignes = await lisLignesDeFeuille(contenu, optionsDeLecture);

    expect(lignes).toEqual([{ Nom: 'Dupont', Prénom: '' }]);
  });

  it("rejette un contenu qui n'est pas un classeur", async () => {
    const contenu = new TextEncoder().encode('PK pas un classeur').buffer;

    await expect(
      lisLignesDeFeuille(contenu as ArrayBuffer, optionsDeLecture)
    ).rejects.toThrow(ErreurFichierInvalide);
  });

  it('rejette un classeur qui contient plusieurs feuilles', async () => {
    const contenu = unClasseur({
      'Ma feuille': [['Un titre'], ['Nom', 'Prénom'], ['Dupont', 'Jeanne']],
      'Une autre': [['A']],
    });

    await expect(lisLignesDeFeuille(contenu, optionsDeLecture)).rejects.toThrow(
      ErreurFichierInvalide
    );
  });

  it("rejette un classeur dont la feuille n'a pas le nom attendu", async () => {
    const contenu = unClasseur({
      'Mauvais nom': [['Un titre'], ['Nom', 'Prénom'], ['Dupont', 'Jeanne']],
    });

    await expect(lisLignesDeFeuille(contenu, optionsDeLecture)).rejects.toThrow(
      ErreurFichierInvalide
    );
  });

  it('rejette un classeur auquel il manque une colonne attendue', async () => {
    const contenu = unClasseur({
      'Ma feuille': [['Un titre'], ['Nom', 'Autre'], ['Dupont', 'Jeanne']],
    });

    await expect(lisLignesDeFeuille(contenu, optionsDeLecture)).rejects.toThrow(
      ErreurFichierInvalide
    );
  });

  it('rejette un classeur qui dépasse le nombre maximum de lignes', async () => {
    const contenu = unClasseur({
      'Ma feuille': [
        ['Un titre'],
        ['Nom', 'Prénom'],
        ['Dupont', 'Jeanne'],
        ['Martin', 'Paul'],
        ['Durand', 'Louise'],
      ],
    });

    await expect(lisLignesDeFeuille(contenu, optionsDeLecture)).rejects.toThrow(
      ErreurFichierInvalide
    );
  });
});
