import { ErreurDonneesObligatoiresManquantes } from '../erreurs.js';

const manque = (valeur: unknown) => valeur === undefined || valeur === null;

const verifieProprietesRenseignees = <Donnees>(
  donnees: Donnees,
  proprietesRequises: (keyof Donnees)[]
) => {
  proprietesRequises.forEach((requise) => {
    if (manque(donnees?.[requise]))
      throw new ErreurDonneesObligatoiresManquantes(
        `Il manque la donnée ${String(requise)}`
      );
  });
};

export { verifieProprietesRenseignees };
