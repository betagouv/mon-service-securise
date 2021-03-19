var RM = RM || {};

(function (racine) {

  const creeConteneur = function (classe, titre) {
    const div = document.createElement("div");
    div.classList.add(classe);

    if (typeof(titre) !== "undefined") {
      const h2 = document.createElement("h2");
      h2.appendChild(document.createTextNode(titre));
      div.appendChild(h2);
    }

    return div;
  };

  racine.creeConteneur = creeConteneur;
})(RM);
