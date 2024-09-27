<script lang="ts">
  import type { Departement } from './inscription.d';

  export let valeur: Departement | '' = '';
  export let departements: Departement[];
</script>

<select bind:value={valeur}>
  <option value="" disabled selected>Sélectionner un département</option>
  {#each departements as departement}
    <option value={departement}>{departement.nom}</option>
  {/each}
</select>

<style>
  select {
    appearance: auto;
  }
</style>
