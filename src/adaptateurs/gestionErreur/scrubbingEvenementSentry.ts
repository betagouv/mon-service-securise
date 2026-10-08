const VALEUR_FILTREE = '[Filtré]';

const CLES_SENSIBLES = [
  'nomService',
  'nom',
  'siret',
  'authorization',
  'cookie',
];

const JETON_BEARER = /Bearer\s+\S+/g;

const estUneCleSensible = (cle: string) =>
  CLES_SENSIBLES.some(
    (sensible) => sensible.toLowerCase() === cle.toLowerCase()
  );

const estUnObjet = (valeur: unknown): valeur is Record<string, unknown> =>
  typeof valeur === 'object' && valeur !== null;

const scrubDonnee = (donnee: unknown): unknown => {
  if (Array.isArray(donnee)) return donnee.map(scrubDonnee);
  if (estUnObjet(donnee))
    return Object.fromEntries(
      Object.entries(donnee).map(([cle, valeur]) => [
        cle,
        estUneCleSensible(cle) ? VALEUR_FILTREE : scrubDonnee(valeur),
      ])
    );
  if (typeof donnee === 'string')
    return donnee.replace(JETON_BEARER, `Bearer ${VALEUR_FILTREE}`);
  return donnee;
};

const scrubEvenementSentry = <T extends Record<string, unknown>>(
  evenement: T
): T => scrubDonnee(evenement) as T;

export { scrubEvenementSentry };
