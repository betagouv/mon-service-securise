var RM = RM || {};

(function (racine) {
  const prefixeTab = "tab-";
  const classeTabActif = "actif";

  var ongletCourant;

  const selectionneOnglet = function (idOnglet) {
    if (typeof(ongletCourant) !== "undefined") {
      document.getElementById(ongletCourant).classList.add("invisible");
      document.getElementById(prefixeTab + ongletCourant).classList.remove(classeTabActif);
    }

    document.getElementById(prefixeTab + idOnglet).classList.add(classeTabActif);
    const conteneur = document.getElementById(idOnglet);
    conteneur.classList.remove("invisible");
    conteneur.dispatchEvent(new Event("renduVisible"));
    ongletCourant = idOnglet;
  };

  const creeOnglet = function (onglet, index) {
    const main = document.getElementsByTagName("main")[0];
    const header = document.getElementsByTagName("header")[0];

    const div = RM.creeConteneur("invisible");
    div.classList.add("onglet-" + onglet.id);
    div.id = onglet.id;
    main.appendChild(div);

    const titre = document.createElement("h1");
    titre.appendChild(document.createTextNode(onglet.titre));
    div.appendChild(titre);

    const tab = RM.creeConteneur("tab");
    tab.id = prefixeTab + onglet.id;
    const etape = document.createElement("span");
    etape.classList.add("etape");
    etape.appendChild(document.createTextNode(index + 1));
    tab.appendChild(etape);
    const libelle = document.createElement("span");
    libelle.classList.add("titre-etape");
    libelle.appendChild(document.createTextNode(onglet.titre));
    tab.appendChild(libelle);
    tab.addEventListener("click", function () { selectionneOnglet(onglet.id); });
    header.appendChild(tab);
  };

  const creeOnglets = function (onglets) {
    onglets.forEach(creeOnglet);
  };

  racine.creeOnglets = creeOnglets;
  racine.selectionneOnglet = selectionneOnglet;
})(RM);

