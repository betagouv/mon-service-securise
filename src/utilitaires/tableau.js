function zipTableaux(tableauGauche, tableauDroite, proprieteCommune) {
  const erreurTailleDifferente = () =>
    new Error(
      `Impossible de ziper des tableaux de tailles différentes. Ici [${tableauGauche.length}] et [${tableauDroite.length}].`
    );

  if (tableauGauche.length !== tableauDroite.length)
    throw erreurTailleDifferente();

  return tableauGauche.map((gauche) => {
    const droite = tableauDroite.find(
      (autre) => gauche[proprieteCommune] === autre[proprieteCommune]
    );

    return { ...gauche, ...droite };
  });
}

export default { zipTableaux };
