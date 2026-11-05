import { idLigne, type RisqueApplique, type TousRisques } from './risquesV2.d';
import type { ReferentielVecteursRisque } from '../risques/risques';

export const risquesAppliques = (
  risques: TousRisques,
  vecteursRisque: ReferentielVecteursRisque
) =>
  Object.fromEntries(
    Object.entries(vecteursRisque).map(([idVecteur, vecteur]) => [
      idVecteur,
      Object.fromEntries(
        Object.keys(vecteur.intitulesObjectifsVises).map((idObjectif) => [
          idLigne(idVecteur, idObjectif),
          risqueCorrespondantA(risques, idVecteur, idObjectif),
        ])
      ),
    ])
  );

const risqueCorrespondantA = (
  risques: TousRisques,
  idVecteur: string,
  idObjectif: string
): RisqueApplique => {
  const risqueSpecifique = risques.risquesSpecifiques.find(
    (rs) => rs.idModele === idLigne(idVecteur, idObjectif)
  );

  if (risqueSpecifique) return { type: 'specifique', ...risqueSpecifique };

  const risque = risques.risques.find(
    (r) => r.idVecteur === idVecteur && r.idsObjectifsVises.includes(idObjectif)
  );

  if (risque) return { type: 'ANSSI', ...risque };

  return undefined;
};
