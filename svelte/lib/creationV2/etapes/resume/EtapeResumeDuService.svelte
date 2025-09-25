<script lang="ts">
  import { leBrouillon } from '../brouillon.store';
  import { questionsV2 } from '../../../../../donneesReferentielMesuresV2';
</script>

<div class="conteneur-avec-cadre">
  <h5>Informations génériques sur le projet</h5>
  <dl>
    <dt>Nom du service :</dt>
    <dd>{$leBrouillon.nomService}</dd>
    <dt>Organisation :</dt>
    <dd>{$leBrouillon.siret}</dd>
    <dt>Statut :</dt>
    <dd>
      {questionsV2.statutDeploiement[$leBrouillon.statutDeploiement]
        .description}
    </dd>
    <dt>Présentation :</dt>
    <dd>{$leBrouillon.presentation}</dd>
    <dt>URL du service :</dt>
    <dd>
      {#if $leBrouillon.pointsAcces?.length > 0}
        {#each $leBrouillon.pointsAcces as pointAcces}
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
      {#each $leBrouillon.typeService as typeDeService}
        <span>{questionsV2.typeDeService[typeDeService].nom}</span>
      {/each}
    </dd>
    <dt>Sécurisations prévues :</dt>
    <dd>
      {#if $leBrouillon.specificitesProjet?.length > 0}
        {#each $leBrouillon.specificitesProjet as sp}
          <span>{questionsV2.specificiteProjet[sp].nom}</span>
        {/each}
      {:else}
        -
      {/if}
    </dd>
    <dt>Hébergement du système :</dt>
    <dd>{questionsV2.typeHebergement[$leBrouillon.typeHebergement].nom}</dd>
  </dl>
</div>
<div class="conteneur-avec-cadre">
  <h5>Évaluation de la criticité et de l'exposition du service</h5>
  <dl>
    <dt>Ouverture du système :</dt>
    <dd>{questionsV2.ouvertureSysteme[$leBrouillon.ouvertureSysteme].nom}</dd>
    <dt>Audience cible du service :</dt>
    <dd>{questionsV2.audienceCible[$leBrouillon.audienceCible].nom}</dd>
    <dt>Durée maximale acceptable de dysfonctionnement du système :</dt>
    <dd>
      {questionsV2.dureeDysfonctionnementAcceptable[
        $leBrouillon.dureeDysfonctionnementAcceptable
      ].nom}
    </dd>
    <dt>Données traitées :</dt>
    <dd>
      {#if $leBrouillon.categoriesDonneesTraitees?.length > 0 || $leBrouillon.categoriesDonneesTraiteesSupplementaires?.length > 0}
        {#each $leBrouillon.categoriesDonneesTraitees as c}
          <span>{questionsV2.categorieDonneesTraitees[c].nom}</span>
        {/each}
        {#each $leBrouillon.categoriesDonneesTraiteesSupplementaires as cs}
          <span>{cs}</span>
        {/each}
      {:else}
        -
      {/if}
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
