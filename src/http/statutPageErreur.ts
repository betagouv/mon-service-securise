const PREMIER_STATUT_ERREUR = 400;
const ERREUR_INTERNE = 500;

const estStatutErreur = (statut?: number): statut is number =>
  statut !== undefined && statut >= PREMIER_STATUT_ERREUR;

export const statutPageErreur = ({
  statutErreur,
  statutReponse,
}: {
  statutErreur?: number;
  statutReponse: number;
}) => [statutErreur, statutReponse].find(estStatutErreur) ?? ERREUR_INTERNE;
