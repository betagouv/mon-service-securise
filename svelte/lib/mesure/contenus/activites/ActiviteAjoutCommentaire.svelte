<script lang="ts">
  import { encode } from 'html-entities';
  import type { ActiviteMesure, DetailsAjoutCommentaire } from '../../mesure.d';
  import { contributeurs } from '../../../tableauDesMesures/stores/contributeurs.store';

  interface Props {
    activite: ActiviteMesure;
  }

  let { activite }: Props = $props();
  let details = $derived(activite.details as DetailsAjoutCommentaire);

  const regexUUID =
    /@\[([0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12})\]/gm;

  let contenu = $derived(
    encode(details.contenu)
      .replaceAll(regexUUID, (_s, idUtilisateur) => {
        const contributeur = $contributeurs.find((c) => c.id === idUtilisateur);
        const texte = contributeur
          ? contributeur.prenomNom
          : 'Utilisateur·rice';
        return `<mss-mention>@${encode(texte)}</mss-mention>`;
      })
      .replaceAll(/\n/gm, '<br>')
  );
</script>

<div>
  <span>
    {@html contenu}
  </span>
</div>

<style>
  :global(mss-mention) {
    color: var(--bleu-mise-en-avant);
    font-weight: 700;
  }
</style>
