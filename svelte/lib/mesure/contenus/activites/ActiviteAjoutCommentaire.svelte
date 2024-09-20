<script lang="ts">
  import type { ActiviteMesure, DetailsAjoutCommentaire } from '../../mesure.d';
  import { decode } from 'html-entities';
  import { contributeurs } from '../../../tableauDesMesures/stores/contributeurs.store';

  export let activite: ActiviteMesure;
  const details = <DetailsAjoutCommentaire>activite.details;

  const regexUUID =
    /@\[([0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12})\]/gm;

  const contenu = decode(details.contenu)
    .replaceAll(regexUUID, (_s, idUtilisateur) => {
      const contributeur = $contributeurs.find((c) => c.id === idUtilisateur);
      const texte = contributeur ? contributeur.prenomNom : 'Utilisateur·rice';
      return `<span class="mention">@${texte}</span>`;
    })
    .replaceAll(/\n/gm, '<br>');
</script>

<div>
  <span>{@html contenu}</span>
</div>

<style>
  :global(.mention) {
    color: var(--bleu-mise-en-avant);
    font-weight: 700;
  }
</style>
