<script lang="ts">
  import { onMount } from 'svelte';
  import type { MesureReferentiel } from '../ui/types.d';

  let mesuresReferentiel: Record<string, MesureReferentiel> = {};

  onMount(async () => {
    const reponse = await axios.get<Record<string, MesureReferentiel>>(
      '/api/referentiel/mesures'
    );
    mesuresReferentiel = reponse.data;
  });
</script>

<table>
  <thead>
    <tr>
      <th>Intitulé de la mesure</th>
    </tr>
  </thead>
  <tbody>
    {#each Object.values(mesuresReferentiel) as mesure}
      <tr>
        <td>{mesure.description}</td>
      </tr>
    {/each}
  </tbody>
</table>

<style>
</style>
