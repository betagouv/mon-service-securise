<script lang="ts">
  import RapportTeleversementGenerique from '../../rapportTeleversement/RapportTeleversementGenerique.svelte';
  import { onMount } from 'svelte';
  import {
    confirmeImport,
    progressionTeleversement,
    recupereRapportDetaille,
  } from '../../rapportTeleversement/rapportTeleversement.api';
  import { singulierPluriel } from '../../ui/string';
  import type { ResumeRapportTeleversement } from '../../rapportTeleversement/rapportTeleversementGenerique.types';
  import LigneService from '../../rapportTeleversement/composants/LigneService.svelte';
  import type { RapportDetaille } from '../../rapportTeleversement/rapportTeleversement.types';
  import ModaleDeProgression from '../../rapportTeleversement/ModaleDeProgression.svelte';

  let rapport: RapportDetaille;
  let resume: ResumeRapportTeleversement;

  let etatReseau:
    | 'CHARGEMENT_DU_RAPPORT'
    | 'RAPPORT_OBTENU'
    | 'IMPORT_EN_COURS'
    | 'IMPORT_FINI' = 'CHARGEMENT_DU_RAPPORT';

  onMount(async () => {
    const resultat = await recupereRapportDetaille();
    if (!resultat) return;

    rapport = resultat;
    const nbOK = rapport.services.filter((s) => s.erreurs.length === 0).length;
    const erreurs = rapport.services.filter((s) => s.erreurs.length > 0).length;

    const labelOK = singulierPluriel(
      '1 service valide',
      `${nbOK} services valides`,
      nbOK
    );
    const labelErreurs = singulierPluriel(
      '1 service invalide',
      `${erreurs} services invalides`,
      erreurs
    );

    resume = {
      elementsValide: { label: labelOK },
      elementsErreur: erreurs ? { label: labelErreurs } : null,
      statut: rapport.statut,
      labelValiderTeleversement: singulierPluriel(
        'Importer le service',
        `Importer les ${nbOK} services`,
        nbOK
      ),
    };

    etatReseau = 'RAPPORT_OBTENU';
  });
</script>

{#if etatReseau === 'RAPPORT_OBTENU'}
  <RapportTeleversementGenerique
    titreDuRapport="Rapport du téléversement des services"
    {resume}
    on:valideTeleversement={async () => {
      etatReseau = 'IMPORT_EN_COURS';
      await confirmeImport();
    }}
    on:retenteTeleversement={() => console.log('🔄')}
    on:annule={() => {
      etatReseau = 'IMPORT_FINI';
    }}
  >
    <table slot="tableau-du-rapport">
      <thead>
        <tr>
          <th scope="colgroup">État</th>
          <th scope="colgroup" class="bordure-droite">Raison de l'erreur</th>
          <th>Ligne</th>
          <th>Nom du service numérique</th>
          <th>SIRET de l'organisation</th>
          <th>Nombre d'organisation(s) utilisatrice(s)</th>
          <th>Type</th>
          <th>Provenance</th>
          <th>Statut</th>
          <th>Localisation des données</th>
          <th>Durée maximale de dysfonctionnement</th>
          <th>Date d'homologation</th>
          <th>Durée d'homologation</th>
          <th>Autorité</th>
          <th>Fonction de l'autorité</th>
        </tr>
      </thead>
      <tbody>
        {#each rapport.services as service, idx (idx)}
          {#if service.erreurs.length > 0}
            <LigneService {service} numeroLigne={idx + 1} />
          {/if}
        {/each}
        {#each rapport.services as service, idx (idx)}
          {#if service.erreurs.length === 0}
            <LigneService {service} numeroLigne={idx + 1} />
          {/if}
        {/each}
      </tbody>
    </table>
  </RapportTeleversementGenerique>
{:else if etatReseau === 'IMPORT_EN_COURS'}
  <ModaleDeProgression
    apiGetProgression={async () => {
      const { data } = await progressionTeleversement();
      return data.progression;
    }}
    on:fini={() => {
      etatReseau = 'IMPORT_FINI';
    }}
  />
{/if}
