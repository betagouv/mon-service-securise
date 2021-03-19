var RM = RM || {};

(function (racine) {
  const ajouteConteneurRecapitulatifDansOnglet = function (
    idConteneur, menacesSelectionnees, mesuresSelectionnees
  ) {

    const metsAJourRecapitulatif = function (e) {
      const conteneur = e.target;
      conteneur.innerHTML = "";

      const risquesIdentifies = RM.creeConteneur("risques", "Risques identifiés");
      conteneur.appendChild(risquesIdentifies);

      const risquesResiduels = RM.creeConteneur("risques", "Risques résiduels");
      conteneur.appendChild(risquesResiduels);

      const grilleRisquesIdentifies = RM.creeConteneur("grille-risques");
      risquesIdentifies.appendChild(grilleRisquesIdentifies);

      const grilleRisquesResiduels = RM.creeConteneur("grille-risques");
      risquesResiduels.appendChild(grilleRisquesResiduels);

      menacesSelectionnees.forEach(function (menace) {
        const divRisqueIdentifie = RM.creeConteneur("risque");
        divRisqueIdentifie.appendChild(document.createTextNode(menace.nom));

        const divRisqueResiduel = RM.creeConteneur("risque");
        divRisqueResiduel.appendChild(document.createTextNode(menace.nom));

        const divMesures = RM.creeConteneur("mesures-associees");
        const mesuresAssociees = mesuresSelectionnees.filter(function (mesure) {
          return mesure.risquesConcernes.includes(menace.id);
        });
        mesuresAssociees.forEach(function (mesure) {
          const divMesure = RM.creeConteneur("mesure-associee");
          divMesure.appendChild(document.createTextNode(mesure.nom));
          divMesures.appendChild(divMesure);
        });

        if (mesuresAssociees.length > 0) {
          grilleRisquesIdentifies.appendChild(divRisqueIdentifie);
          grilleRisquesIdentifies.appendChild(divMesures);
        } else {
          grilleRisquesResiduels.appendChild(divRisqueResiduel);
          grilleRisquesResiduels.appendChild(divMesures);
        }
      });
    };

    const conteneur = document.getElementById(idConteneur);
    conteneur.addEventListener("renduVisible", metsAJourRecapitulatif);
  };

  RM.ajouteConteneurRecapitulatifDansOnglet = ajouteConteneurRecapitulatifDansOnglet;
})(RM);
