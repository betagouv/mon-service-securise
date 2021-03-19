var RM = RM || {};

(function (racine) {


  const ajouteConteneurItemsSelectionnables = function (
    idConteneur,
    idListeItemsSelectionnables, titreConteneurItemsSelectionnables, itemsSelectionnables,
    idListeItemsSelectionnes, titreConteneurItemsSelectionnes, itemsSelectionnes,
    callBackCreationConteneurDetails) {

    const creeConteneurItemSelectionnable = function (itemCourant, contexte) {
      const prefixeItem = contexte.nomItem + "-";
      const div = RM.creeConteneur(contexte.nomItem);
      div.id = prefixeItem + itemCourant.id;
      div.appendChild(document.createTextNode(itemCourant.nom));

      const input = document.createElement("input");
      input.classList.add("ajoute-item");
      input.type = "submit";
      input.value = contexte.libelleBoutonSelection;
      input.addEventListener("click", function (e) {
        contexte.listeArrivee.push(itemCourant);

        const idItem = parseInt(e.target.parentNode.id.replace(prefixeItem, ""));
        contexte.listeDepart.supprimeItemAvecId(idItem);

        metsAJourContenus();
      });
      div.appendChild(input);

      if (contexte.itemEditable) {
        div.appendChild(callBackCreationConteneurDetails(itemCourant));
      }

      return div;
    };

    const metsAJourConteneurItemsSelectionnables = function (idConteneur, contexte) {
      const conteneur = document.getElementById(idConteneur);
      conteneur.innerHTML = "";

      contexte.listeDepart.forEach(function (item) {
        const conteneurItem = creeConteneurItemSelectionnable(item, contexte);
        conteneur.appendChild(conteneurItem);
      });
    };

    const metsAJourItemsSelectionnables = function () {
      metsAJourConteneurItemsSelectionnables(idListeItemsSelectionnables, {
        nomItem: "item-selectionnable",
        itemEditable: false,
        libelleBoutonSelection: "+",
        listeDepart: itemsSelectionnables,
        listeArrivee: itemsSelectionnes
      });
    };

    const metsAJourItemsSelectionnes = function () {
      metsAJourConteneurItemsSelectionnables(idListeItemsSelectionnes, {
        nomItem: "item-selectionne",
        itemEditable: true,
        libelleBoutonSelection: "-",
        listeDepart: itemsSelectionnes,
        listeArrivee: itemsSelectionnables
      });
    };

    const creeConteneurItemsSelectionnables = function (classe, titre, idConteneurItems) {
      const conteneur = RM.creeConteneur(classe, titre);
      const conteneurItems = RM.creeConteneur("liste-" + classe);
      conteneurItems.id = idConteneurItems;
      conteneur.appendChild(conteneurItems);

      return conteneur;
    };

    const creeConteneurSelectionnable = function () {
      const conteneurs = [{
        classe: "items-selectionnables",
        titre: titreConteneurItemsSelectionnables,
        idConteneurItems: idListeItemsSelectionnables
      }, {
        classe: "items-selectionnes",
        titre: titreConteneurItemsSelectionnes,
        idConteneurItems: idListeItemsSelectionnes
      }]

      const div = RM.creeConteneur("grille-items-selectionnables");
      conteneurs.forEach(function (c) {
        div.appendChild(creeConteneurItemsSelectionnables(c.classe, c.titre, c.idConteneurItems));
      });

      return div;
    };

    const metsAJourContenus = function () {
      metsAJourItemsSelectionnables();
      metsAJourItemsSelectionnes();
    };

    const conteneur = document.getElementById(idConteneur);
    conteneur.appendChild(creeConteneurSelectionnable());
    conteneur.addEventListener("renduVisible", metsAJourContenus);
  };

  racine.ajouteConteneurItemsSelectionnables = ajouteConteneurItemsSelectionnables;
})(RM);
