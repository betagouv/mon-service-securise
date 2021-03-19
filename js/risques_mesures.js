var RM = RM || {};

(function (racine) {
  const demarre = function () {
    const menacesSelectionnees = [];
    const mesuresSelectionnees = [];

    RM.ajouteEntete();

    RM.creeOnglets([
      { id: "risques", titre: "J'évalue les risques" },
      { id: "mesures", titre: "Je me protège" },
      { id: "recapitulatif", titre: "Synthèse" }
    ]);

    RM.ajouteConteneurRisquesDansOnglet("risques", menacesSelectionnees);
    RM.ajouteConteneurMesuresDansOnglet("mesures", menacesSelectionnees, mesuresSelectionnees);
    RM.ajouteConteneurRecapitulatifDansOnglet("recapitulatif", menacesSelectionnees, mesuresSelectionnees);
    RM.selectionneOnglet("risques");
  };

  racine.demarre = demarre;
})(RM);
