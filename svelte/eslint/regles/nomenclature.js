import path from 'node:path';

const EXTENSIONS_IMPORTABLES = ['.ts', '.js', '.svelte'];

const designeUnEntrypoint = (cheminAbsolu) => {
  const extension = path.extname(cheminAbsolu);
  const sansExtension = EXTENSIONS_IMPORTABLES.includes(extension)
    ? cheminAbsolu.slice(0, -extension.length)
    : cheminAbsolu;

  const [dossierLib, dossierComposant, fichier] = sansExtension
    .split(path.sep)
    .slice(-3);
  return dossierLib === 'lib' && fichier === dossierComposant;
};

export const estFichierEntrypoint = (nomFichier) =>
  nomFichier.endsWith('.ts') && designeUnEntrypoint(nomFichier);

export const resoudDepuis = (nomFichier, source) => {
  if (!source.startsWith('.')) return null;
  return path.resolve(path.dirname(nomFichier), source);
};

export const estImportEntrypoint = (nomFichier, source) => {
  const cheminResolu = resoudDepuis(nomFichier, source);
  return cheminResolu !== null && designeUnEntrypoint(cheminResolu);
};
