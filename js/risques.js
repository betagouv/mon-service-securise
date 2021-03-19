var RM = RM || {};

(function (racine) {
  var menacesProbables = [{
    id: 1,
    nom: "Vandalisation"
  }, {
    id: 2,
    nom: "Vol de données"
  }, {
    id: 3,
    nom: "Interruption de service"
  }];

  const creeConteneurDetailRisqueSelectionne = function (itemCourant, menacesSelectionnees) {
    const details = RM.creeConteneur("details-item");
    details.appendChild(RM.creeConteneur("fleche"));
    const contexteMenace = RM.creeConteneur("contexte-menace");
    details.appendChild(contexteMenace);
    contexteMenace.appendChild(document.createTextNode("Mon contexte"));
    contexteMenace.appendChild(document.createElement("br"));

    const textArea = document.createElement("textarea");
    if (itemCourant.contexte) { textArea.value = itemCourant.contexte; }
    textArea.addEventListener("input", function (e) {
      itemCourant.contexte = e.target.value;
    });
    contexteMenace.appendChild(textArea);

    return details;
  }

  const ajouteConteneurRisquesDansOnglet = function (idConteneur, menacesSelectionnees) {
    RM.ajouteConteneurItemsSelectionnables(
      idConteneur,
      "liste-menaces-probables", "Menaces probables", menacesProbables,
      "liste-menaces-selectionnees", "Menaces sélectionnées", menacesSelectionnees,
      function (itemCourant) { return creeConteneurDetailRisqueSelectionne(itemCourant, menacesSelectionnees) ; }
    );
  };

  racine.ajouteConteneurRisquesDansOnglet = ajouteConteneurRisquesDansOnglet;
})(RM);
