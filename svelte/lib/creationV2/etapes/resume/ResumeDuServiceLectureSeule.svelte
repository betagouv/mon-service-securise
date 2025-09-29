<script lang="ts">
  import { resume } from './resume.store';
</script>

<div class="conteneur-avec-cadre">
  <h5>Informations génériques sur le projet</h5>
  <dl>
    <dt>Nom du service :</dt>
    <dd>{$resume.nomService}</dd>
    <dt>Organisation :</dt>
    <dd>{$resume.siret}</dd>
    <dt>Statut :</dt>
    <dd>
      {$resume.statutDeploiement}
    </dd>
    <dt>Présentation :</dt>
    <dd>{$resume.presentation}</dd>
    <dt>URL du service :</dt>
    <dd>
      {#if $resume.pointsAcces.length > 0}
        {#each $resume.pointsAcces as pointAcces}
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
      {#each $resume.typeService as typeDeService}
        <span>{typeDeService}</span>
      {/each}
    </dd>
    <dt>Sécurisations prévues :</dt>
    <dd>
      {#if $resume.specificitesProjet.length > 0}
        {#each $resume.specificitesProjet as sp}
          <span>{sp}</span>
        {/each}
      {:else}
        -
      {/if}
    </dd>
    <dt>Hébergement du système :</dt>
    <dd>{$resume.typeHebergement}</dd>
  </dl>
</div>
<div class="conteneur-avec-cadre">
  <h5>Évaluation de la criticité et de l'exposition du service</h5>
  <dl>
    <dt>Ouverture du système :</dt>
    <dd>{$resume.ouvertureSysteme}</dd>
    <dt>Audience cible du service :</dt>
    <dd>{$resume.audienceCible}</dd>
    <dt>Durée maximale acceptable de dysfonctionnement du système :</dt>
    <dd>{$resume.dureeDysfonctionnementAcceptable}</dd>
    <dt>Données traitées :</dt>
    <dd>
      {#if $resume.categoriesDonneesTraitees.length > 0 || $resume.categoriesDonneesTraiteesSupplementaires.length > 0}
        {#each $resume.categoriesDonneesTraitees as c}
          <span>{c}</span>
        {/each}
        {#each $resume.categoriesDonneesTraiteesSupplementaires as cs}
          <span>{cs}</span>
        {/each}
      {:else}
        -
      {/if}
    </dd>
    <dt>Volume des données traitées :</dt>
    <dd>{$resume.volumetrieDonneesTraitees}</dd>
    <dt>Localisation des données traitées</dt>
    <dd>
      {#each $resume.localisationsDonneesTraitees as l}
        <span>{l}</span>
      {/each}
    </dd>
  </dl>
</div>

<style lang="scss">
  .conteneur-avec-cadre {
    max-width: 924px;
    border: 1px solid #ddd;
    display: flex;
    flex-direction: column;
    gap: 16px;
    padding: 24px;
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
