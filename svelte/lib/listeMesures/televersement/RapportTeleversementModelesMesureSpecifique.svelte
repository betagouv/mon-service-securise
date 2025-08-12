<script lang="ts">
  import { onMount } from 'svelte';
  import { recupereRapportDetaille } from './rapportTeleversementModelesMesureSpecifique.api';

  onMount(async () => {
    const resultat = await recupereRapportDetaille();
    if (!resultat) return;

    console.log(`📋 ${JSON.stringify(resultat)}`);
  });
</script>
