<script lang="ts">
  import type { ReferentielStatut } from './types.d';

  export let id: string;
  export let statut: string | undefined;
  export let referentielStatuts: ReferentielStatut;

  export let estLectureSeule = false;
</script>

<label for={`statut-${id}`}>
  <select
    bind:value={statut}
    id={`statut-${id}`}
    class="intouche"
    disabled={estLectureSeule}
    on:change
  >
    <option value="" disabled selected>--</option>
    {#each Object.entries(referentielStatuts) as [valeur, label]}
      <option value={valeur}>{label}</option>
    {/each}
  </select>
</label>

<style>
  select {
    appearance: auto;
  }
</style>
