<script lang="ts">
  import RapportTeleversementGenerique from '../../rapportTeleversement/RapportTeleversementGenerique.svelte';
  import { onMount } from 'svelte';
  import { recupereRapportDetaille } from '../../rapportTeleversement/rapportTeleversement.api';
  import { singulierPluriel } from '../../ui/string';
  import type { ResumeRapportTeleversement } from '../../rapportTeleversement/rapportTeleversementGenerique.types';
  import LigneService from '../../rapportTeleversement/composants/LigneService.svelte';
  import type { RapportDetaille } from '../../rapportTeleversement/rapportTeleversement.types';

  let rapport: RapportDetaille;
  let resume: ResumeRapportTeleversement;

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
    };
  });
</script>

<RapportTeleversementGenerique
  titreDuRapport="Rapport du téléversement des services"
  {resume}
>
  <table slot="tableau-du-rapport">
    {#if rapport}
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
    {/if}
  </table>
</RapportTeleversementGenerique>
