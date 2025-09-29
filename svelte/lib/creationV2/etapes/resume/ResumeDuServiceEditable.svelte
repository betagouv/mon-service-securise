<script lang="ts">
  import { leBrouillon } from '../brouillon.store';
  import { questionsV2 } from '../../../../../donneesReferentielMesuresV2';
  import { tick } from 'svelte';
  import { metsAJourBrouillonService } from '../../creationV2.api';
  import ListeChampTexte from '../ListeChampTexte.svelte';

  const supprimeValeurPointAcces = (index: number) => {
    $leBrouillon.pointsAcces = $leBrouillon.pointsAcces.filter(
      (_, i) => i !== index
    );
  };

  const ajouteValeurPointAcces = () => {
    $leBrouillon.pointsAcces = [...$leBrouillon.pointsAcces, ''];
  };

  const enregistrePointsAcces = async () => {
    await enregistre(
      'pointsAcces',
      $leBrouillon.pointsAcces.filter(
        (pointAcces) => pointAcces.trim().length > 0
      )
    );
  };

  const enregistre = async (propriete: string, valeur: string | string[]) => {
    await metsAJourBrouillonService($leBrouillon.id, {
      [propriete]: valeur,
    });
  };
</script>

<div class="conteneur-avec-cadre">
  <h5>Informations génériques sur le projet</h5>

  <dsfr-input
    label="Nom du service à sécuriser*"
    type="text"
    id="nom-service"
    nom="nom-service"
    value={$leBrouillon.nomService}
    status={$leBrouillon.nomService.length >= 1 ? 'default' : 'error'}
    errorMessage="Le nom du service est obligatoire."
    on:blur={(e) => {
      $leBrouillon.nomService = e.target.value;
      if ($leBrouillon.nomService.length >= 1) {
        return enregistre('nomService', $leBrouillon.nomService);
      }
    }}
  />

  <dsfr-input
    label="Organisation responsable du projet*"
    type="text"
    id="siret"
    nom="siret"
    status={/^\d{14}$/.test($leBrouillon.siret) ? 'default' : 'error'}
    errorMessage="Le SIRET est invalide."
    value={$leBrouillon.siret}
    on:blur={(e) => {
      $leBrouillon.siret = e.target.value;
      if (/^\d{14}$/.test($leBrouillon.siret)) {
        return enregistre('siret', $leBrouillon.siret);
      }
    }}
  />

  <dsfr-select
    label="Statut*"
    placeholder="Sélectionnez un statut"
    options={Object.entries(questionsV2.statutDeploiement).map(
      ([statut, { description }]) => ({ value: statut, label: description })
    )}
    value={$leBrouillon.statutDeploiement}
    id="statutDeploiement"
    on:valuechanged={(e) => {
      $leBrouillon.statutDeploiement = e.detail;
      return enregistre('statutDeploiement', $leBrouillon.statutDeploiement);
    }}
    placeholderDisabled
  />

  <dsfr-textarea
    label="Présentation du service*"
    type="text"
    id="presentation"
    rows={3}
    value={$leBrouillon.presentation}
    status={$leBrouillon.presentation.length >= 1 ? 'default' : 'error'}
    errorMessage="La présentation du service est obligatoire."
    on:blur={(e) => {
      $leBrouillon.presentation = e.target.value;
      if ($leBrouillon.presentation.length >= 1) {
        return enregistre('presentation', $leBrouillon.presentation);
      }
    }}
  />

  <label for="url-service">URL du service</label>
  <ListeChampTexte
    nomGroupe="pointsAcces"
    bind:valeurs={$leBrouillon.pointsAcces}
    on:ajout={ajouteValeurPointAcces}
    titreSuppression="Supprimer l'URL"
    titreAjout="Ajouter une URL"
    on:blur={() => enregistrePointsAcces()}
    on:suppression={async (e) => {
      supprimeValeurPointAcces(e.detail);
      await tick();
      await enregistrePointsAcces();
    }}
  />
</div>

<!--div class="conteneur-avec-cadre">
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
</div-->

<style lang="scss">
  .conteneur-avec-cadre {
    max-width: 924px;
    border: 1px solid #ddd;
    display: flex;
    flex-direction: column;
    padding: 24px;
  }
  h5 {
    margin: 0;
    padding: 0;
    font-weight: 700;
    font-size: 1.375rem;
    line-height: 1.75;
  }
  label {
    font-size: 1rem;
    line-height: 1.5rem;
    color: #161616;
  }
</style>
