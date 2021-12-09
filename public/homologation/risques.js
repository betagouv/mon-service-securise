import { brancheAjoutItem, peupleListeItems } from '../modules/saisieListeItems.js';
import { parametresAvecItemsExtraits } from '../modules/parametres.js';
import texteHTML from '../modules/texteHTML.js';

$(() => {
  let indexMaxRisquesSpecifiques = 0;

  const COULEURS_NIVEAUX_GRAVITE = ['blanc', 'vert', 'jaune', 'orange', 'rouge'];

  const NIVEAUX_GRAVITE = JSON.parse($('#donnees-referentiel-niveaux-gravite-risque').text());

  const ajouteInformationsModales = () => {
    $('.information').click((eInformation) => {
      $('body').css('overflow', 'hidden');
      $('.rideau', $(eInformation.target)).css('display', 'flex');

      $('.fermeture-modale', $(eInformation.target)).click((eFermeture) => {
        eFermeture.stopPropagation();
        $('.rideau', $(eInformation.target)).css('display', '');
        $('body').css('overflow', '');
      });
    });
  };

  const metsAJourAffichageNiveauGravite = ($risque, niveau) => {
    $('input', $risque).val(niveau);

    const { position, description } = NIVEAUX_GRAVITE[niveau];
    const $disques = $('.disque', $risque);
    $disques.removeClass('eteint');
    $disques.removeClass(COULEURS_NIVEAUX_GRAVITE.join(' '));
    $disques.addClass((i) => (i <= position ? COULEURS_NIVEAUX_GRAVITE[position] : 'eteint'));
    $disques.first().toggleClass('cercle', position === 0);
    $('.legende', $risque).text(description);
  };

  const brancheComportementSaisieNiveauGravite = ($r) => {
    const $disques = $('.disque', $r);
    $disques.click((e) => {
      const $disque = $(e.target);
      const niveau = $disque.attr('niveau');

      metsAJourAffichageNiveauGravite($r, niveau);
    });
  };

  const ajouteZoneSaisieCommentairePourRisque = ($r, nom) => {
    const $lien = $('a', $r);
    const $zoneSaisie = $(`<textarea id=${nom} name=${nom}></textarea>`);
    $zoneSaisie.hide();
    $lien.click(() => $zoneSaisie.toggle());

    $zoneSaisie.appendTo($r);
  };

  const peupleRisquesGeneraux = (selecteurDonnees) => {
    const donneesRisques = JSON.parse($(selecteurDonnees).text());
    donneesRisques.forEach(({ id, commentaire, niveauGravite }) => {
      if (commentaire) $(`#commentaire-${id}`).show().val(texteHTML(commentaire));

      const $risque = $(`.risque#${id}`);
      if (niveauGravite) metsAJourAffichageNiveauGravite($risque, niveauGravite);
    });
  };

  const zoneSaisieRisqueSpecifique = (index, donnees = {}) => {
    const { description = '', commentaire = '' } = donnees;

    return `
<input id="description-risque-specifique-${index}"
       name="description-risque-specifique-${index}"
       placeholder="Description du risque"
       value="${description}">
<textarea id="commentaire-risque-specifique-${index}"
          name="commentaire-risque-specifique-${index}"
          placeholder="Commentaires additionnels (facultatifs)">${commentaire}</textarea>
    `;
  };

  const brancheAjoutRisqueSpecifique = (...params) => brancheAjoutItem(
    ...params,
    zoneSaisieRisqueSpecifique,
    () => (indexMaxRisquesSpecifiques += 1),
  );

  const peupleRisquesSpecifiques = (...params) => (
    peupleListeItems(...params, zoneSaisieRisqueSpecifique)
  );

  ajouteInformationsModales();
  $('.risque').each((_, $r) => {
    brancheComportementSaisieNiveauGravite($r);
    ajouteZoneSaisieCommentairePourRisque($r, `commentaire-${$r.id}`);
  });

  peupleRisquesGeneraux('#donnees-risques-generaux');

  indexMaxRisquesSpecifiques = peupleRisquesSpecifiques('#risques-specifiques', '#donnees-risques-specifiques');
  brancheAjoutRisqueSpecifique('.nouvel-item', '#risques-specifiques');

  const $bouton = $('.bouton');
  const identifiantHomologation = $bouton.attr('identifiant');

  $bouton.click(() => {
    const params = parametresAvecItemsExtraits(
      'form#risques',
      'risquesSpecifiques',
      '^(description|commentaire)-risque-specifique-',
    );

    axios.post(`/api/homologation/${identifiantHomologation}/risques`, params)
      .then((reponse) => (window.location = `/homologation/${reponse.data.idHomologation}`));
  });
});
