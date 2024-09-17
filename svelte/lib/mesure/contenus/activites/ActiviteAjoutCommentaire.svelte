<script lang="ts">
  import type { ActiviteMesure, DetailsAjoutCommentaire } from '../../mesure.d';
  import { decode } from 'html-entities';

  export let activite: ActiviteMesure;

  const details = <DetailsAjoutCommentaire>activite.details;
</script>

<div>
  <span>{decode(details.contenu)}</span>
</div>
