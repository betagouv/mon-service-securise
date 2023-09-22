import {
  brancheComportementSaisieNiveauGravite,
  metsAJourAffichageNiveauGravite,
} from '../interactions/saisieNiveauGravite.js';

const $inputDescription = (index, description, lectureSeule) =>
  $(`
<input id="description-risque-specifique-${index}"
     name="description-risque-specifique-${index}"
     placeholder="Description du risque"
     ${lectureSeule ? 'readonly' : ''}
     value="${description}">
  `);

const $disque = (niveau) =>
  $(`<div class="disque" data-niveau="${niveau}"></div>`);

const $curseur = (niveaux, lectureSeule) =>
  Object.keys(niveaux).reduce(
    ($acc, n) => $acc.append($disque(n)),
    $(`<div class="curseur" ${lectureSeule ? 'readonly' : ''}></div>`)
  );

const $saisieNiveauGravite = (
  index,
  niveauGravite,
  niveaux,
  couleurs,
  lectureSeule
) => {
  const $conteneurSaisie = $(`
<div class="niveau-gravite">
<input id="niveauGravite-risque-specifique-${index}"
       name="niveauGravite-risque-specifique-${index}"
       type="hidden"
       value="${niveauGravite}">
</div>
  `);
  $conteneurSaisie.append(
    $curseur(niveaux, lectureSeule),
    $('<div class="legende"></div>')
  );
  if (!lectureSeule)
    brancheComportementSaisieNiveauGravite($conteneurSaisie, niveaux, couleurs);

  if (niveauGravite) {
    const { position, description } = niveaux[niveauGravite];
    metsAJourAffichageNiveauGravite(
      $conteneurSaisie,
      niveauGravite,
      couleurs,
      position,
      description
    );
  }

  return $conteneurSaisie;
};

const $textareaCommentaire = (index, commentaire, lectureSeule) =>
  $(`
<textarea id="commentaire-risque-specifique-${index}"
        name="commentaire-risque-specifique-${index}"
        placeholder="Commentaires additionnels (facultatifs)"
        ${lectureSeule ? 'readonly' : ''}>${commentaire}</textarea>
  `);

const $saisieRisqueSpecifique = (
  index,
  niveaux,
  couleurs,
  donnees = {},
  lectureSeule = false
) => {
  const { description = '', niveauGravite = '', commentaire = '' } = donnees;

  const $conteneur = $(
    '<div class="saisie-risque-specifique"><div class="synthese"></div></div>'
  );

  $('.synthese', $conteneur).append(
    $inputDescription(index, description, lectureSeule),
    $saisieNiveauGravite(index, niveauGravite, niveaux, couleurs, lectureSeule)
  );

  $conteneur.append($textareaCommentaire(index, commentaire, lectureSeule));

  return $conteneur;
};

export default $saisieRisqueSpecifique;
