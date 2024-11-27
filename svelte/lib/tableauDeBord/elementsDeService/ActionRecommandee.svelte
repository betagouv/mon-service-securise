<script lang="ts">
  import type { ActionRecommandee } from '../tableauDeBord.d';
  import Lien from '../../ui/Lien.svelte';

  export let action: ActionRecommandee;
  export let idService: string;
</script>

{#if action === 'mettreAJour'}
  <Lien
    titre="Mettre à jour les informations"
    type="bouton-secondaire"
    href="/service/{idService}"
    taille="petit"
    icone="attention"
  />
{/if}
