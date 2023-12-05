<script lang="ts">
  import type { MesuresExistantes, MesureSpecifique } from './mesure.d';

  export let idService: string;
  export let categories: Record<string, string>;
  export let statuts: Record<string, string>;
  export let mesuresExistantes: MesuresExistantes;

  let intitule: string, details: string, categorie: string, statut: string;

  let enCoursEnvoi = false;
  const enregistreMesure = async () => {
    enCoursEnvoi = true;
    const mesureSpecifique: MesureSpecifique = {
      categorie,
      description: intitule,
      modalites: details,
      statut,
    };
    mesuresExistantes.mesuresSpecifiques.push(mesureSpecifique);
    await axios.post(`/api/service/${idService}/mesures`, mesuresExistantes);
    enCoursEnvoi = false;
    window.location.reload();
  };
</script>

<span>Ajoutée</span>

<label for="intitule" class="requis">
  Intitulé
  <textarea
    bind:value={intitule}
    name="intitule"
    placeholder="ex: lorem ipsum"
    class="intouche"
    required
  />
</label>

<label for="details">
  Détails sur la mise en œuvre
  <textarea
    bind:value={details}
    name="details"
    placeholder="ex: lorem ipsum"
    class="intouche"
  />
</label>

<label for="categorie" class="requis">
  Catégorie
  <select bind:value={categorie} name="categorie" class="intouche" required>
    <option value="" disabled selected>Non renseigné</option>
    {#each Object.entries(categories) as [valeur, label]}
      <option value={valeur}>{label}</option>
    {/each}
  </select>
</label>

<label for="statut" class="requis">
  Statut de mise en œuvre
  <select bind:value={statut} name="statut" class="intouche" required>
    <option value="" disabled selected>Non renseigné</option>
    {#each Object.entries(statuts) as [valeur, label]}
      <option value={valeur}>{label}</option>
    {/each}
  </select>
</label>

<div class="conteneur-bouton">
  <button
    on:click={enregistreMesure}
    class="bouton"
    class:en-cours-chargement={enCoursEnvoi}
    disabled={enCoursEnvoi}>Enregistrer</button
  >
</div>

<style>
  span {
    position: absolute;
    top: 24px;
    left: 32px;
    font-size: 0.95em;
    font-weight: 500;
    color: #08416a;
    border-radius: 40px;
    background: #ffffff;
    padding: 4px 10px;
  }

  label {
    font-weight: bold;
  }

  select {
    appearance: auto;
  }

  textarea,
  select {
    margin-top: 8px;
    margin-bottom: 16px;
  }

  label.requis:before {
    content: '*';
    color: var(--rose-anssi);
    transform: translate(6px, -3px);
  }

  .conteneur-bouton {
    margin-top: 24px;
    display: flex;
    justify-content: end;
  }
</style>
