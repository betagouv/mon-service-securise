<script lang="ts">
  import RapportTeleversementGenerique from '../../rapportTeleversement/RapportTeleversementGenerique.svelte';
  import { onMount } from 'svelte';
  import {
    confirmeImportV2,
    progressionTeleversementV2,
    recupereRapportDetailleV2,
    supprimeTeleversementV2,
  } from './rapportTeleversementServices.api';
  import { singulierPluriel } from '../../outils/string';
  import type { ResumeRapportTeleversement } from '../../rapportTeleversement/rapportTeleversementGenerique.types.d';
  import ModaleDeProgression from '../../rapportTeleversement/ModaleDeProgression.svelte';
  import { toasterStore } from '../../ui/stores/toaster.store';
  import { tiroirStore } from '../../ui/stores/tiroir.store';
  import TiroirTeleversementServicesV2 from './TiroirTeleversementServicesV2.svelte';
  import { enleveParametreDeUrl } from '../../outils/url';
  import { triRapportDetaille } from '../../rapportTeleversement/tri';
  import LigneServiceV2 from './LigneServiceV2.svelte';
  import type { RapportDetailleV2 } from './rapportTeleversementServicesV2.types';

  let rapport: RapportDetailleV2;
  let resume: ResumeRapportTeleversement;

  let etatReseau:
    | 'CHARGEMENT_DU_RAPPORT'
    | 'RAPPORT_OBTENU'
    | 'IMPORT_EN_COURS'
    | 'IMPORT_FINI' = 'CHARGEMENT_DU_RAPPORT';

  onMount(async () => {
    const resultat = await recupereRapportDetailleV2();
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
      erreurGenerale:
        rapport.services.length === 0 ? 'Aucune ligne détectée' : null,
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
      await confirmeImportV2();
      enleveParametreDeUrl('rapportTeleversementV2');
    }}
    on:retenteTeleversement={async () => {
      await supprimeTeleversementV2();
      etatReseau = 'IMPORT_FINI';
      tiroirStore.afficheContenu(TiroirTeleversementServicesV2, {});
      enleveParametreDeUrl('rapportTeleversementV2');
    }}
    on:annule={() => {
      etatReseau = 'IMPORT_FINI';
      enleveParametreDeUrl('rapportTeleversementV2');
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
          <th>Statut</th>
          <th>Type</th>
          <th>Type d'hébergement utilisé</th>
          <th>Ouverture du système</th>
          <th>Audience cible du service</th>
          <th>Durée maximale acceptable de dysfonctionnement</th>
          <th>Volume des données traitées</th>
          <th>Localisation des données traitées</th>
          <th>Date d'homologation</th>
          <th>Durée d'homologation</th>
          <th>Autorité</th>
          <th>Fonction de l'autorité</th>
        </tr>
      </thead>
      <tbody>
        {#each rapport.services.toSorted(triRapportDetaille) as ligne}
          <LigneServiceV2 {ligne} />
        {/each}
      </tbody>
    </table>
  </RapportTeleversementGenerique>
{:else if etatReseau === 'IMPORT_EN_COURS'}
  <ModaleDeProgression
    apiGetProgression={async () => {
      const { data } = await progressionTeleversementV2();
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
        )} afin d’accéder à une évaluation personnalisée de leur sécurité et bénéficier de recommandations adaptées.`,
        true
      );

      document.body.dispatchEvent(new CustomEvent('rafraichis-services'));
      etatReseau = 'IMPORT_FINI';
    }}
  />
{/if}
