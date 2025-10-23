<script lang="ts">
  import type { ActiviteMesure, DetailsAjoutCommentaire } from '../../mesure.d';
  import DOMPurify from 'isomorphic-dompurify';
  import { contributeurs } from '../../../tableauDesMesures/stores/contributeurs.store';

  export let activite: ActiviteMesure;
  const details = <DetailsAjoutCommentaire>activite.details;

  const regexUUID =
    /@\[([0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12})\]/gm;

  const contenu = details.contenu
    .replaceAll(regexUUID, (_s, idUtilisateur) => {
      const contributeur = $contributeurs.find((c) => c.id === idUtilisateur);
      const texte = contributeur ? contributeur.prenomNom : 'Utilisateur·rice';
      return `<mss-mention>@${texte}</mss-mention>`;
    })
    .replaceAll(/\n/gm, '<br>');
</script>

<div>
  <span>
    {@html DOMPurify.sanitize(contenu, { ALLOWED_TAGS: ['mss-mention'] })}
  </span>
</div>

<style>
  :global(mss-mention) {
    color: var(--bleu-mise-en-avant);
    font-weight: 700;
  }
</style>
