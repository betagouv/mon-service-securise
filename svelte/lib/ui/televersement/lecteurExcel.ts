export class ErreurFichierInvalide extends Error {}

export type LigneExcel = Record<string, string>;

export type OptionsDeLecture = {
  nomFeuille: string;
  indexLigneEnTete: number;
  colonnesAttendues: string[];
  nombreMaximumDeLignes: number;
};

const ouvreClasseur = async (
  contenu: ArrayBuffer,
  nombreDeLignesLues: number
) => {
  const { read } = await import('@e965/xlsx');
  try {
    return read(contenu, {
      type: 'array',
      cellFormula: false,
      cellHTML: false,
      sheetRows: nombreDeLignesLues,
    });
  } catch {
    throw new ErreurFichierInvalide();
  }
};

export const lisLignesDeFeuille = async (
  contenu: ArrayBuffer,
  {
    nomFeuille,
    indexLigneEnTete,
    colonnesAttendues,
    nombreMaximumDeLignes,
  }: OptionsDeLecture
): Promise<LigneExcel[]> => {
  const uneLigneDePlusPourDetecterLeDepassement = 1;
  const classeur = await ouvreClasseur(
    contenu,
    indexLigneEnTete +
      nombreMaximumDeLignes +
      uneLigneDePlusPourDetecterLeDepassement
  );

  const feuille = classeur.Sheets[nomFeuille];
  const contientUneSeuleFeuille = classeur.SheetNames.length === 1;
  if (!feuille || !contientUneSeuleFeuille) throw new ErreurFichierInvalide();

  const { utils } = await import('@e965/xlsx');
  const lignes = utils.sheet_to_json<LigneExcel>(feuille, {
    range: indexLigneEnTete - 1,
    defval: '',
    raw: false,
  });

  const estComplete = (ligne: LigneExcel) =>
    colonnesAttendues.every((colonne) => Object.hasOwn(ligne, colonne));

  if (lignes.length > nombreMaximumDeLignes || !lignes.every(estComplete))
    throw new ErreurFichierInvalide();

  return lignes;
};
