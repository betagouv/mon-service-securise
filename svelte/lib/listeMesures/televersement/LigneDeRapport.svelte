<script lang="ts">
  import {
    type ErreurModele,
    MessagesErreur,
    type ModeleTeleverse,
  } from './rapportTeleversementModelesMesureSpecifique.types.d';
  import TagEtat from '../../rapportTeleversement/composants/TagEtat.svelte';
  import CelluleDonnee from '../../rapportTeleversement/composants/CelluleDonnee.svelte';
  import { decode } from 'html-entities';
  import TooltipErreursMultiple from '../../rapportTeleversement/composants/TooltipErreursMultiple.svelte';

  export let ligne: ModeleTeleverse;

  const aUneErreur = ligne.erreurs.length > 0;
  const aDesErreurs = ligne.erreurs.length > 1;

  const contientErreur = (erreur: ErreurModele) =>
    ligne.erreurs.includes(erreur);
</script>

<tr>
  <th scope="row"><TagEtat valide={!aUneErreur} /></th>
  <th scope="row" class="message-erreur" class:aUneErreur>
    <div class="cellule-erreur">
      {aUneErreur
        ? `${MessagesErreur[ligne.erreurs[0]]}${aDesErreurs ? '…' : ''}`
        : 'Aucune erreur'}
      {#if aDesErreurs}
        <TooltipErreursMultiple
          erreurs={ligne.erreurs.map((e) => MessagesErreur[e])}
        />
      {/if}
    </div>
  </th>
  <CelluleDonnee contenu={ligne.numeroLigne.toString()} />
  <CelluleDonnee
    contenu={decode(ligne.modele.description)}
    enErreur={contientErreur('INTITULE_MANQUANT')}
    gras
  />
  <CelluleDonnee contenu={decode(ligne.modele.descriptionLongue)} />
  <CelluleDonnee
    contenu={ligne.modele.categorie}
    enErreur={contientErreur('CATEGORIE_INCONNUE')}
  />
</tr>
