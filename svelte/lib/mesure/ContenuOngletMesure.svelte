<script lang="ts">
  import { configurationAffichage, store } from './mesure.store';
  import SelectionStatut from '../ui/SelectionStatut.svelte';
  import { validationChamp } from '../directives/validationChamp';
  import { rechercheTextuelle } from '../tableauDesMesures/stores/rechercheTextuelle.store';
  import type { ReferentielStatut } from '../ui/types';

  export let estLectureSeule: boolean;
  export let categories: Record<string, string>;
  export let statuts: ReferentielStatut;
  export let retoursUtilisateur: Record<string, string>;
  export let visible: boolean;
  export let retourUtilisateur: string;
  export let commentaireRetourUtilisateur: string;

  $: texteSurligne = $store.mesureEditee.mesure.descriptionLongue?.replace(
    new RegExp($rechercheTextuelle, 'ig'),
    (texte: string) => ($rechercheTextuelle ? `<mark>${texte}</mark>` : texte)
  );
</script>

<div class:visible id="contenu-onglet-mesure">
  {#if $configurationAffichage.doitAfficherIntitule}
    <label for="intitule" class="requis">
      Intitulé
      <textarea
        rows="2"
        bind:value={$store.mesureEditee.mesure.description}
        id="intitule"
        placeholder="Titre de la mesure"
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
      {#if $store.mesureEditee.mesure.lienBlog}
        <a
          class="lien-blog"
          href={$store.mesureEditee.mesure.lienBlog}
          target="_blank"
          rel="noopener">Comment mettre en œuvre cette mesure ?</a
        >
      {/if}
    </details>
  {/if}

  <div class="conteneur-statut">
    <SelectionStatut
      bind:statut={$store.mesureEditee.mesure.statut}
      id="statut"
      {estLectureSeule}
      referentielStatuts={statuts}
      label="Statut"
      requis
    />
    <div class="mention-requis">
      <span class="asterisque">*</span>
      <span>champ obligatoire</span>
    </div>
  </div>

  <label for="details">
    Précisions sur la mesure
    <textarea
      rows="6"
      bind:value={$store.mesureEditee.mesure.modalites}
      id="details"
      placeholder="Apportez des précisions sur la mesure, ses modalités de mise en œuvre, etc."
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
  {/if}
</div>

<style>
  #contenu-onglet-mesure:not(.visible) {
    display: none;
  }

  label {
    font-weight: bold;
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
    background: white;
  }

  label.requis:before {
    content: '*';
    color: var(--rose-anssi);
    transform: translate(6px, -3px);
    margin-left: -10px;
    margin-right: 4px;
  }

  details,
  .conteneur-statut,
  label {
    margin-bottom: 30px;
  }

  .conteneur-retour-utilisateur label {
    margin-bottom: 0;
  }

  .conteneur-statut {
    position: relative;
  }

  .mention-requis {
    position: absolute;
    top: 0;
    right: 0;

    color: var(--texte-clair);
    font-style: normal;
    font-weight: 400;
    font-size: 14px;
    line-height: 22px;
  }

  .mention-requis .asterisque {
    color: var(--rose-anssi);
  }

  summary {
    font-weight: bold;
    cursor: pointer;
    display: flex;
    flex-direction: row;
    align-items: center;
  }

  summary:before {
    content: 'Description de la mesure';
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
    font-weight: 400;
  }

  a.lien-blog {
    display: block;
  }

  a.lien-blog::after {
    display: inline-block;
    content: '';
    width: 16px;
    height: 16px;
    background: url('/statique/assets/images/home/icone_lien_externe.svg')
      no-repeat center;
    filter: invert(29%) sepia(71%) saturate(1558%) hue-rotate(181deg)
      brightness(70%) contrast(132%);
    margin: auto 5px;
    background-position-y: 2px;
  }
</style>
