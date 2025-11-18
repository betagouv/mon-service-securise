export const valeurBooleenne = (valeur: string) => {
  switch (valeur) {
    case 'true':
      return true;
    case 'false':
      return false;
    default:
      return undefined;
  }
};
