var RM = RM || {};

(function (racine) {

  var mesuresPossibles = [{
    id: 1,
    nom: "Chiffrement",
    risquesConcernes: []
  }, {
    id: 2,
    nom: "Formation utilisateurs",
    risquesConcernes: []
  }];

  const creeConteneurMenace = function (menace, mesureCourante) {
    const conteneur = RM.creeConteneur("risque-pour-mesure");

    const inputRisqueConcerne = document.createElement("input");
    inputRisqueConcerne.id = "risque-concerne-" + menace.id;
    inputRisqueConcerne.type = "checkbox";
    inputRisqueConcerne.checked = mesureCourante.risquesConcernes.includes(menace.id);
    inputRisqueConcerne.addEventListener("change", function (e) {
      if (e.target.checked) {
        mesureCourante.risquesConcernes.push(menace.id);
      } else {
        mesureCourante.risquesConcernes.supprimeItem(menace.id);
      }
    });

    conteneur.appendChild(inputRisqueConcerne);
    conteneur.appendChild(document.createTextNode(menace.nom));
    conteneur.appendChild(document.createElement("br"));

    return conteneur;
  };

  const creeConteneurRisquesPourMesure = function (mesureCourante, menacesSelectionnees) {
    const risquesPourMesure = RM.creeConteneur("risques-pour-mesure");
    menacesSelectionnees.forEach(function (menace) {
      const conteneurMenace = creeConteneurMenace(menace, mesureCourante);
      risquesPourMesure.appendChild(conteneurMenace);
    });

    return risquesPourMesure;
  };

  const creeConteneurDetailMesureSelectionnee = function (itemCourant, menacesSelectionnees) {
    const details = RM.creeConteneur("details-item");
    details.appendChild(RM.creeConteneur("fleche"));

    const grille = RM.creeConteneur("grille-details-mesure");
    details.appendChild(grille);

    const detailsMesure = RM.creeConteneur("details-mesure");
    detailsMesure.appendChild(document.createTextNode("Détails"));
    grille.append(detailsMesure);

    const risquesAssocies = RM.creeConteneur("risques-associes");
    risquesAssocies.appendChild(document.createTextNode("Risques concernés"));
    grille.appendChild(risquesAssocies);

    const textArea = document.createElement("textarea");
    if (itemCourant.contexte) { textArea.value = itemCourant.contexte; }
    textArea.addEventListener("input", function (e) {
      itemCourant.contexte = e.target.value;
    });
    grille.appendChild(textArea);

    const risquesPourMesure = creeConteneurRisquesPourMesure(itemCourant, menacesSelectionnees);
    grille.appendChild(risquesPourMesure);

    return details;
  }

  const ajouteConteneurMesuresDansOnglet = function (idConteneur, menacesSelectionnees, mesuresSelectionnees) {
    RM.ajouteConteneurItemsSelectionnables(
      idConteneur,
      "liste-mesures-possibles", "Mesures possibles", mesuresPossibles,
      "liste-mesures-selectionnees", "Mesures sélectionnées", mesuresSelectionnees,
      function (itemCourant) { return creeConteneurDetailMesureSelectionnee(itemCourant, menacesSelectionnees) ; }
    );
  };

  racine.ajouteConteneurMesuresDansOnglet = ajouteConteneurMesuresDansOnglet
})(RM);
