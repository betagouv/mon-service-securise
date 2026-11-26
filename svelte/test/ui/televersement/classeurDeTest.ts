import { read, utils, write } from '@e965/xlsx';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

type Cellule = string | number;

export const unClasseur = (feuilles: Record<string, Cellule[][]>) => {
  const classeur = utils.book_new();
  Object.entries(feuilles).forEach(([nomFeuille, lignes]) =>
    utils.book_append_sheet(classeur, utils.aoa_to_sheet(lignes), nomFeuille)
  );
  return write(classeur, { type: 'array', bookType: 'xlsx' }) as ArrayBuffer;
};

export const leTemplateComplete = (
  nomFichier: string,
  nomFeuille: string,
  ligneAjoutee: Cellule[]
) => {
  const chemin = resolve(
    import.meta.dirname,
    '../../../../public/assets/fichiers',
    nomFichier
  );
  const classeur = read(readFileSync(chemin), { type: 'buffer' });
  utils.sheet_add_aoa(classeur.Sheets[nomFeuille], [ligneAjoutee], {
    origin: 'A7',
  });
  return write(classeur, { type: 'array', bookType: 'xlsx' }) as ArrayBuffer;
};
