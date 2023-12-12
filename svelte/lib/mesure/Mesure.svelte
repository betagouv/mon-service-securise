<script lang="ts">
  import type { MesuresExistantes, MesureSpecifique } from './mesure.d';
  import Formulaire from '../ui/Formulaire.svelte';
  import { validationChamp } from '../directives/validationChamp';

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

<Formulaire on:formulaireValide={enregistreMesure}>
  <label for="intitule" class="requis">
    Intitulé
    <textarea
      rows="2"
      bind:value={intitule}
      id="intitule"
      placeholder="Description de la mesure"
      class="intouche"
      required
      use:validationChamp={"L'intitulé est obligatoire. Veuillez le renseigner."}
    />
  </label>

  <label for="details">
    Détails sur la mise en œuvre
    <textarea
      rows="10"
      bind:value={details}
      id="details"
      placeholder="Modalités de mise en œuvre (facultatif)"
      class="intouche"
    />
  </label>

  <label for="categorie" class="requis">
    Catégorie
    <select
      bind:value={categorie}
      id="categorie"
      class="intouche"
      required
      use:validationChamp={'Ce champ est obligatoire. Veuillez sélectionner une option.'}
    >
      <option value="" disabled selected>Non renseigné</option>
      {#each Object.entries(categories) as [valeur, label]}
        <option value={valeur}>{label}</option>
      {/each}
    </select>
  </label>

  <label for="statut" class="requis">
    Statut de mise en œuvre
    <select
      bind:value={statut}
      id="statut"
      class="intouche"
      required
      use:validationChamp={'Ce champ est obligatoire. Veuillez sélectionner une option.'}
    >
      <option value="" disabled selected>Non renseigné</option>
      {#each Object.entries(statuts) as [valeur, label]}
        <option value={valeur}>{label}</option>
      {/each}
    </select>
  </label>

  <div class="conteneur-bouton">
    <button
      type="submit"
      class="bouton"
      class:en-cours-chargement={enCoursEnvoi}
      disabled={enCoursEnvoi}
      >Enregistrer
    </button>
  </div>
</Formulaire>

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
    margin-bottom: 16px;
  }

  select {
    appearance: auto;
  }

  textarea {
    height: auto;
  }

  textarea,
  select {
    margin-top: 8px;
    margin-bottom: 0;
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

  :global(.erreur-champ-saisie) {
    margin: 4px 0 0 0;
    color: var(--rose-anssi);
    font-weight: normal;
    flex-direction: row;
  }

  :global(.erreur-champ-saisie:before) {
    content: '';
    display: flex;
    background-image: url('/statique/assets/images/icone_attention_rose_2.svg');
    background-repeat: no-repeat;
    background-size: contain;
    width: 20px;
    height: 20px;
    margin-right: 8px;
  }

  :global(textarea.invalide, select.invalide) {
    border-color: var(--rose-anssi);
  }
</style>
