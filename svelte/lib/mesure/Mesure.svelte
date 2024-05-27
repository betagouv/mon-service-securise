<script lang="ts">
  import Formulaire from '../ui/Formulaire.svelte';
  import SuppressionMesureSpecifique from './suppression/SuppressionMesureSpecifique.svelte';
  import type { MesuresExistantes } from './mesure.d';

  import { validationChamp } from '../directives/validationChamp';
  import { configurationAffichage, store } from './mesure.store';
  import { enregistreMesures, enregistreRetourUtilisateur } from './mesure.api';
  import SelectionStatut from '../ui/SelectionStatut.svelte';
  import { rechercheTextuelle } from '../tableauDesMesures/tableauDesMesures.store';

  export let idService: string;
  export let categories: Record<string, string>;
  export let statuts: Record<string, string>;
  export let retoursUtilisateur: Record<string, string>;
  export let mesuresExistantes: MesuresExistantes;
  export let estLectureSeule: boolean;

  let enCoursEnvoi = false;
  const enregistreMesure = async () => {
    enCoursEnvoi = true;
    const promesses = [enregistreMesures(idService, mesuresExistantes, $store)];
    if (
      $configurationAffichage.doitAfficherRetourUtilisateur &&
      retourUtilisateur
    ) {
      promesses.push(
        enregistreRetourUtilisateur(
          idService,
          $store.mesureEditee.metadonnees.idMesure as string,
          retourUtilisateur,
          commentaireRetourUtilisateur
        )
      );
    }
    await Promise.all(promesses);
    enCoursEnvoi = false;
    document.body.dispatchEvent(
      new CustomEvent('mesure-modifiee', {
        detail: { sourceDeModification: 'tiroir' },
      })
    );
  };

  $: texteSurligne = $store.mesureEditee.mesure.descriptionLongue?.replace(
    new RegExp($rechercheTextuelle, 'ig'),
    (texte: string) => ($rechercheTextuelle ? `<mark>${texte}</mark>` : texte)
  );

  let retourUtilisateur: string;
  let commentaireRetourUtilisateur: string;
</script>

{#if $store.etape === 'SuppressionSpecifique'}
  <SuppressionMesureSpecifique {idService} {mesuresExistantes} />
{:else}
  <Formulaire on:formulaireValide={enregistreMesure}>
    {#if $configurationAffichage.doitAfficherIntitule}
      <label for="intitule" class="requis">
        Intitulé
        <textarea
          rows="2"
          bind:value={$store.mesureEditee.mesure.description}
          id="intitule"
          placeholder="Description de la mesure"
          readonly={estLectureSeule}
          required
          use:validationChamp={"L'intitulé est obligatoire. Veuillez le renseigner."}
        />
      </label>
    {/if}
    {#if $configurationAffichage.doitAfficherDescriptionLongue}
      <details open={true}>
        <summary />
        <p>
          {@html texteSurligne}
        </p>
      </details>
    {/if}

    <label for="details">
      Détails sur la mise en œuvre
      <textarea
        rows="6"
        bind:value={$store.mesureEditee.mesure.modalites}
        id="details"
        placeholder="Modalités de mise en œuvre (facultatif)"
        readonly={estLectureSeule}
      />
    </label>

    {#if $configurationAffichage.doitAfficherChoixCategorie}
      <label for="categorie" class="requis">
        Catégorie
        <select
          bind:value={$store.mesureEditee.mesure.categorie}
          id="categorie"
          required
          disabled={estLectureSeule}
          use:validationChamp={'Ce champ est obligatoire. Veuillez sélectionner une option.'}
        >
          <option value="" disabled selected>-</option>
          {#each Object.entries(categories) as [valeur, label]}
            <option value={valeur}>{label}</option>
          {/each}
        </select>
      </label>
    {/if}

    <SelectionStatut
      bind:statut={$store.mesureEditee.mesure.statut}
      id="statut"
      {estLectureSeule}
      referentielStatuts={statuts}
      label="Statut de mise en œuvre"
      requis
    />

    {#if !estLectureSeule}
      {#if $configurationAffichage.doitAfficherRetourUtilisateur}
        <div class="conteneur-retour-utilisateur">
          <label for="retour-utilisateur">
            Donnez votre avis sur cette mesure
            <select
              id="retour-utilisateur"
              name="retour-utilisateur"
              bind:value={retourUtilisateur}
            >
              <option value="" disabled selected>-</option>
              {#each Object.entries(retoursUtilisateur) as [valeur, label]}
                <option value={valeur}>{label}</option>
              {/each}
            </select>
          </label>
          {#if retourUtilisateur}
            <textarea
              bind:value={commentaireRetourUtilisateur}
              placeholder="Apportez des précisions ou formulez une suggestion."
              rows="3"
            ></textarea>
          {/if}
        </div>
      {/if}

      <div class="conteneur-actions">
        {#if $configurationAffichage.doitAfficherSuppression}
          <!-- svelte-ignore a11y-click-events-have-key-events -->
          <p on:click={store.afficheEtapeSuppression}>Supprimer la mesure</p>
        {/if}
        <button
          type="submit"
          class="bouton"
          class:en-cours-chargement={enCoursEnvoi}
          disabled={enCoursEnvoi}
          >Enregistrer
        </button>
      </div>
    {/if}
  </Formulaire>
{/if}

<style>
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

  #categorie {
    border-right: 8px solid transparent;
  }

  label.requis:before {
    content: '*';
    color: var(--rose-anssi);
    transform: translate(6px, -3px);
    margin-left: -10px;
    margin-right: 4px;
  }

  .conteneur-actions {
    display: flex;
    justify-content: space-between;
    align-items: center;
    position: sticky;
    bottom: 0;
    width: calc(100% + 4em);
    margin: 24px 0 -2em -2em;
    border-top: 1px solid #cbd5e1;
    padding: 1em 0;
    background: white;
  }

  .conteneur-actions button[type='submit'] {
    margin-left: auto;
    margin-right: 2em;
  }

  .conteneur-actions p {
    font-weight: 500;
    color: #0079d0;
    cursor: pointer;
    margin: 0 0 0 2em;
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
    background-image: url('/statique/assets/images/icone_attention_rose.svg');
    background-repeat: no-repeat;
    background-size: contain;
    width: 20px;
    height: 20px;
    margin-right: 8px;
  }

  :global(textarea.invalide, select.invalide) {
    border-color: var(--rose-anssi);
  }

  summary {
    font-weight: bold;
    cursor: pointer;
    display: flex;
    flex-direction: row;
    align-items: center;
  }

  summary:before {
    content: 'Description';
  }

  summary:after {
    content: '';
    width: 24px;
    height: 24px;
    background: url('/statique/assets/images/chevron_noir.svg');
    transform: translateY(1px) rotate(90deg);
    transition: transform 0.1s ease-in-out;
  }

  details[open] > summary:after {
    transform: translateY(1px) rotate(270deg);
  }

  details p {
    margin: 8px 0 0;
    font-weight: 500;
  }

  details {
    margin-bottom: 16px;
  }

  .conteneur-retour-utilisateur {
    padding: 16px;
    border-radius: 6px;
    background: #eff6ff;
  }

  .conteneur-retour-utilisateur label {
    margin-bottom: 0;
  }

  .conteneur-retour-utilisateur select {
    background: white;
    border: transparent;
    border-right: 8px solid transparent;
  }

  .conteneur-retour-utilisateur textarea {
    background: white;
  }
</style>
