<script lang="ts">
  export let referentiel: { label: string; classe?: string };
  export let nom: string;
  export let categorie: string;
  export let idStatut: string;
  export let referentielStatuts: Record<string, string>;
</script>

<div class="ligne-de-mesure">
  <span class={referentiel.classe}>{referentiel.label}</span>
  <div class="titre-mesure">
    <p class="titre">{nom}</p>
    <span class="categorie">{categorie}</span>
  </div>
  <label for="statut">
    <select bind:value={idStatut} id="statut" class="intouche" required>
      <option value="" disabled selected>--</option>
      {#each Object.entries(referentielStatuts) as [valeur, label]}
        <option value={valeur}>{label}</option>
      {/each}
    </select>
  </label>
</div>

<style>
  .ligne-de-mesure {
    border-radius: 8px;
    border: 1px solid #cbd5e1;
    padding: 20px 16px;
    gap: 56px;
    margin-bottom: 8px;
    display: grid;
    grid-template-columns: 2fr 6fr 3fr;
    align-items: center;
    justify-content: space-between;
  }

  span {
    color: #08416a;
    background: #f1f5f9;
    border-radius: 40px;
    padding: 4px 10px;
    font-weight: 500;
    display: flex;
    align-items: center;
    justify-content: center;
    width: fit-content;
  }

  span.mss:before {
    content: '';
    display: flex;
    background-image: url('/statique/assets/images/logo_mss_petit.svg');
    background-repeat: no-repeat;
    background-size: contain;
    width: 19px;
    height: 16px;
    margin-right: 6px;
  }

  .titre-mesure {
    display: flex;
    flex-direction: column;
    align-items: flex-start;
    gap: 8px;
  }

  .titre-mesure p {
    margin: 0;
  }

  .titre {
    font-weight: 500;
    text-align: left;
  }

  .categorie {
    color: #667892;
    font-size: 0.9em;
    font-weight: 500;
  }

  select {
    appearance: auto;
  }
</style>
