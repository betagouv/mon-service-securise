<script lang="ts">
  import RapportTeleversementGenerique from '../../rapportTeleversement/RapportTeleversementGenerique.svelte';
  import { onMount } from 'svelte';
  import {
    confirmeImport,
    progressionTeleversement,
    recupereRapportDetaille,
    supprimeTeleversement,
  } from './rapportTeleversementServices.api';
  import { singulierPluriel } from '../../outils/string';
  import type { ResumeRapportTeleversement } from '../../rapportTeleversement/rapportTeleversementGenerique.types';
  import LigneService from './LigneService.svelte';
  import type { RapportDetaille } from './rapportTeleversementServices.types';
  import ModaleDeProgression from '../../rapportTeleversement/ModaleDeProgression.svelte';
  import { toasterStore } from '../../ui/stores/toaster.store';
  import { tiroirStore } from '../../ui/stores/tiroir.store';
  import TiroirTeleversementServices from './TiroirTeleversementServices.svelte';
  import { enleveParametreDeUrl } from '../../outils/url';

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
      elementsValide: nbOK ? { label: labelOK } : null,
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
    on:confirmeTeleversement={async () => {
      etatReseau = 'IMPORT_EN_COURS';
      await confirmeImport();
    }}
    on:retenteTeleversement={async () => {
      await supprimeTeleversement();
      etatReseau = 'IMPORT_FINI';
      tiroirStore.afficheContenu(TiroirTeleversementServices, {});
    }}
    on:annule={() => {
      etatReseau = 'IMPORT_FINI';
      enleveParametreDeUrl('rapportTeleversement');
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
      const nb = rapport.services.length;
      toasterStore.succes(
        singulierPluriel(
          '1 service importé avec succès',
          `${nb} services importés avec succès`,
          nb
        ),
        `Nous vous invitons à <b>finaliser la description</b> de ${singulierPluriel(
          'votre service importé',
          'vos services importés',
          nb
        )} afin d’accéder à une évaluation personnalisée de leur sécurité et bénéficier de recommandations adaptées.`
      );

      document.body.dispatchEvent(new CustomEvent('rafraichis-services'));
      etatReseau = 'IMPORT_FINI';
    }}
  />
{/if}
