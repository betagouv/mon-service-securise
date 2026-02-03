<script lang="ts">
  import { configurationAffichage, store } from '../mesure.store';
  import SelectionStatut from '../../ui/SelectionStatut.svelte';
  import { validationChamp } from '../../directives/validationChamp';
  import { rechercheTextuelle } from '../../tableauDesMesures/stores/rechercheTextuelle.store';
  import type { ReferentielStatut } from '../../ui/types';
  import DescriptionLongueMesure from '../../ui/DescriptionLongueMesure.svelte';

  export let estLectureSeule: boolean;
  export let categories: Record<string, string>;
  export let statuts: ReferentielStatut;
  export let retoursUtilisateur: Record<string, string>;
  export let visible: boolean;
  export let retourUtilisateur: string;
  export let commentaireRetourUtilisateur: string;

  $: texteSurligne = $store.mesureEditee.mesure.descriptionLongue
    ?.replace(new RegExp($rechercheTextuelle, 'ig'), (texte: string) =>
      $rechercheTextuelle ? `<mark>${texte}</mark>` : texte
    )
    .replace(
      new RegExp(/<a.*(<mark>(.*)<\/mark>).*\/a>/gi),
      (chaineEntiere: string, baliseMark: string, contenuSansBalise: string) =>
        chaineEntiere.replaceAll(baliseMark, contenuSansBalise)
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
    <DescriptionLongueMesure
      description={texteSurligne}
      lienBlog={$store.mesureEditee.mesure.lienBlog}
    />
  {/if}
  {#if $configurationAffichage.doitAfficherDescriptionLongueEditable}
    <label for="descriptionLongue">
      Description de la mesure
      <textarea
        rows="2"
        bind:value={$store.mesureEditee.mesure.descriptionLongue}
        id="descriptionLongue"
        placeholder="Description de la mesure"
        readonly={estLectureSeule}
      />
    </label>
  {/if}
  {#if $configurationAffichage.doitAfficherPorteursSinguliers && $store.mesureEditee.mesure.porteursSinguliers}
    <div class="porteurs-singuliers">
      <span class="titre"><b>Responsable indicatif</b></span>
      <span class="sous-titre"
        >Le rôle indiqué est proposé à titre indicatif. Chaque équipe reste
        libre de définir son propre responsable.</span
      >
      <span class="contenu"
        >{$store.mesureEditee.mesure.porteursSinguliers.join(', ')}</span
      >
    </div>
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

<style lang="scss">
  #contenu-onglet-mesure:not(.visible) {
    display: none;
  }

  label {
    font-weight: bold;
    font-size: 1rem;
    line-height: 1.5rem;
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

  .porteurs-singuliers {
    display: flex;
    flex-direction: column;
    gap: 4px;

    .titre {
      font-size: 1rem;
      line-height: 1.5rem;
      color: #282828;
    }

    .sous-titre {
      font-size: 0.75rem;
      line-height: 1.25rem;
      margin-bottom: 4px;
      color: #666666;
    }

    .contenu {
      font-size: 1rem;
      line-height: 1.375rem;
      margin-bottom: 32px;
      color: #000;
    }
  }
</style>
