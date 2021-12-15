import {
  brancheComportementSaisieNiveauGravite,
  metsAJourAffichageNiveauGravite,
} from '../interactions/saisieNiveauGravite.js';

const $inputDescription = (index, description) => (
  $(`
<input id="description-risque-specifique-${index}"
     name="description-risque-specifique-${index}"
     placeholder="Description du risque"
     value="${description}">
  `)
);

const $disque = (niveau) => $(`<div class="disque" niveau="${niveau}"></div>`);

const $curseur = (niveaux) => Object.keys(niveaux)
  .reduce(
    ($acc, n) => $acc.append($disque(n)),
    $('<div class="curseur"></div>')
  );

const $saisieNiveauGravite = (index, niveauGravite, niveaux) => {
  const $conteneurSaisie = $(`
<div class="niveau-gravite">
<input id="niveauGravite-risque-specifique-${index}"
       name="niveauGravite-risque-specifique-${index}"
       type="hidden"
       value="${niveauGravite}">
</div>
  `);
  $conteneurSaisie.append($curseur(niveaux), $('<div class="legende"></div>'));
  brancheComportementSaisieNiveauGravite($conteneurSaisie, niveaux);

  if (niveauGravite) {
    const { position, description } = niveaux[niveauGravite];
    metsAJourAffichageNiveauGravite($conteneurSaisie, niveauGravite, position, description);
  }

  return $conteneurSaisie;
};

const $textareaCommentaire = (index, commentaire) => (
  $(`
<textarea id="commentaire-risque-specifique-${index}"
        name="commentaire-risque-specifique-${index}"
        placeholder="Commentaires additionnels (facultatifs)">${commentaire}</textarea>
  `)
);

const $saisieRisqueSpecifique = (index, donnees = {}, niveaux) => {
  const { description = '', niveauGravite = '', commentaire = '' } = donnees;

  const $conteneur = $('<div class="saisie-risque-specifique"><div class="synthese"></div></div>');

  $('.synthese', $conteneur).append(
    $inputDescription(index, description),
    $saisieNiveauGravite(index, niveauGravite, niveaux),
  );

  $conteneur.append(
    $textareaCommentaire(index, commentaire),
  );

  return $conteneur;
};

export { $saisieRisqueSpecifique as default };
