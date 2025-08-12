type LigneDeRapport = {
  erreurs: string[];
  numeroLigne: number;
};

export function triRapportDetaille(a: LigneDeRapport, b: LigneDeRapport) {
  const aEnErreur = a.erreurs.length > 0;
  const bEnErreur = b.erreurs.length > 0;

  const aValide = a.erreurs.length === 0;
  const bValide = b.erreurs.length === 0;

  if (aEnErreur && bValide) return -1;
  if (aValide && bEnErreur) return 1;

  return a.numeroLigne - b.numeroLigne;
}
