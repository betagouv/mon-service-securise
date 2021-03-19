var RM = RM || {};

(function (racine) {
  const ajouteEntete = function () {
    const header = document.getElementsByTagName("header")[0];
    header.appendChild(RM.creeConteneur("habillage-entete"));
  };

  racine.ajouteEntete = ajouteEntete;
})(RM);
