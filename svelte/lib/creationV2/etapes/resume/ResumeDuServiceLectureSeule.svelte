<script lang="ts">
  import type { DescriptionServiceV2 } from '../../creationV2.types';
  import type { Entite } from '../../../ui/types.d';
  import {
    metEnFormeEntite,
    rechercheOrganisation,
  } from '../../../ui/rechercheOrganisation';
  import { onMount } from 'svelte';

  export let donnees: Record<keyof DescriptionServiceV2, string | string[]>;
  let entite: Entite | undefined;

  onMount(async () => {
    entite = (await rechercheOrganisation(donnees.siret as string))[0];
  });
</script>

<div class="conteneur-avec-cadre">
  <h5>Informations génériques sur le projet</h5>
  <dl>
    <dt>Nom du service :</dt>
    <dd>{donnees.nomService}</dd>
    <dt>Organisation :</dt>
    <dd>{entite ? metEnFormeEntite(entite) : ''}</dd>
    <dt>Statut :</dt>
    <dd>
      {donnees.statutDeploiement}
    </dd>
    <dt>Présentation :</dt>
    <dd>{donnees.presentation || '-'}</dd>
    <dt>URL du service :</dt>
    <dd>
      {#if donnees.pointsAcces.length > 0}
        {#each donnees.pointsAcces as pointAcces}
          <span>{pointAcces}</span>
        {/each}
      {:else}
        -
      {/if}
    </dd>
  </dl>
</div>
<div class="conteneur-avec-cadre">
  <h5>Caractéristiques du service</h5>
  <dl>
    <dt>Type de service à sécuriser :</dt>
    <dd>
      {#each donnees.typeService as typeDeService}
        <span>{typeDeService}</span>
      {/each}
    </dd>
    <dt>Sécurisations prévues :</dt>
    <dd>
      {#if donnees.specificitesProjet.length > 0}
        {#each donnees.specificitesProjet as sp}
          <span>{sp}</span>
        {/each}
      {:else}
        -
      {/if}
    </dd>
    <dt>Hébergement du système :</dt>
    <dd>{donnees.typeHebergement}</dd>
    <dt>Activités du projet entièrement externalisées :</dt>
    <dd>
      {#if donnees.activitesExternalisees.length > 0}
        {#each donnees.activitesExternalisees as ae}
          <span>{ae}</span>
        {/each}
      {:else}
        -
      {/if}
    </dd>
  </dl>
</div>
<div class="conteneur-avec-cadre">
  <h5>Évaluation de la criticité et de l'exposition du service</h5>
  <dl>
    <dt>Ouverture du système :</dt>
    <dd>{donnees.ouvertureSysteme}</dd>
    <dt>Audience cible du service :</dt>
    <dd>{donnees.audienceCible}</dd>
    <dt>Durée maximale acceptable de dysfonctionnement du système :</dt>
    <dd>{donnees.dureeDysfonctionnementAcceptable}</dd>
    <dt>Données traitées :</dt>
    <dd>
      {#if donnees.categoriesDonneesTraitees.length > 0 || donnees.categoriesDonneesTraiteesSupplementaires.length > 0}
        {#each donnees.categoriesDonneesTraitees as c}
          <span>{c}</span>
        {/each}
        {#each donnees.categoriesDonneesTraiteesSupplementaires as cs}
          <span>{cs}</span>
        {/each}
      {:else}
        -
      {/if}
    </dd>
    <dt>Volume des données traitées :</dt>
    <dd>{donnees.volumetrieDonneesTraitees}</dd>
    <dt>Localisation des données traitées :</dt>
    <dd>{donnees.localisationDonneesTraitees}</dd>
  </dl>
</div>

<style lang="scss">
  .conteneur-avec-cadre {
    border: 1px solid #ddd;
    display: flex;
    flex-direction: column;
    gap: 16px;
    padding: 24px;
    border-radius: 8px;
  }
  h5 {
    margin: 0;
    padding: 0;
    font-weight: 700;
    font-size: 1.375rem;
    line-height: 1.75;
  }
  dl {
    margin: 0;
    padding: 0;
    display: grid;
    grid-template-columns: 300px auto;
    grid-row-gap: 8px;
    font-size: 1rem;
    line-height: 1.5;
    font-weight: 400;
    color: #161616;
  }
  dd {
    display: flex;
    flex-direction: column;
  }
</style>
