<script lang="ts">
  import { onMount } from 'svelte';
  import {
    confirmeTeleversementEnCours,
    recupereRapportDetaille,
    supprimeTeleversementEnCours,
  } from './rapportTeleversementModelesMesureSpecifique.api';
  import type { RapportDetaille } from './rapportTeleversementModelesMesureSpecifique.types';
  import { singulierPluriel } from '../../outils/string';
  import type { ResumeRapportTeleversement } from '../../rapportTeleversement/rapportTeleversementGenerique.types';
  import RapportTeleversementGenerique from '../../rapportTeleversement/RapportTeleversementGenerique.svelte';
  import { enleveParametreDeUrl } from '../../outils/url';
  import { triRapportDetaille } from '../../rapportTeleversement/tri';
  import LigneDeRapport from './LigneDeRapport.svelte';
  import { tiroirStore } from '../../ui/stores/tiroir.store';
  import TiroirTeleversementModeleMesureSpecifique from './TiroirTeleversementModeleMesureSpecifique.svelte';
  import { toasterStore } from '../../ui/stores/toaster.store';
  import ModaleDeProgression from '../../rapportTeleversement/ModaleDeProgression.svelte';
  import { modelesMesureSpecifique } from '../../ui/stores/modelesMesureSpecifique.store';
  import { servicesAvecMesuresAssociees } from '../servicesAssocies/servicesAvecMesuresAssociees.store';
  import type { CapaciteAjoutDeMesure } from '../listeMesures.d';

  export let capaciteAjoutDeMesure: CapaciteAjoutDeMesure;

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
    const nbOK = rapport.modelesTeleverses.filter(
      (m) => m.erreurs.length === 0
    ).length;
    const erreurs = rapport.modelesTeleverses.filter(
      (m) => m.erreurs.length > 0
    ).length;

    const labelOK = singulierPluriel(
      '1 mesure valide',
      `${nbOK} mesures valides`,
      nbOK
    );
    const labelErreurs = singulierPluriel(
      '1 mesure invalide',
      `${erreurs} mesures invalides`,
      erreurs
    );

    const { depassementDuNombreMaximum: depassement } = rapport;

    resume = {
      elementsValide: nbOK ? { label: labelOK } : null,
      elementsErreur: erreurs ? { label: labelErreurs } : null,
      statut: rapport.statut,
      labelValiderTeleversement: singulierPluriel(
        'Importer la mesure',
        `Importer les ${nbOK} mesures`,
        nbOK
      ),
      erreurGenerale: depassement
        ? `Votre fichier qui contient
          ${singulierPluriel(
            '1 ligne',
            `${rapport.modelesTeleverses.length} lignes`,
            rapport.modelesTeleverses.length
          )}
           vous ferait dépasser la limite des ${
             capaciteAjoutDeMesure.nombreMaximum
           } mesures. Vous pouvez en ajouter ${
             depassement.nombreMaximum
           } au maximum.`
        : null,
    };

    etatReseau = 'RAPPORT_OBTENU';
  });

  let progression = 0;
  const fausseProgression = async () => {
    progression += 5;
    return progression;
  };
</script>

{#if etatReseau === 'RAPPORT_OBTENU'}
  <RapportTeleversementGenerique
    titreDuRapport="Rapport du téléversement des mesures"
    {resume}
    on:confirmeTeleversement={async () => {
      etatReseau = 'IMPORT_EN_COURS';
      await confirmeTeleversementEnCours();
      enleveParametreDeUrl('rapportTeleversement');
    }}
    on:retenteTeleversement={async () => {
      enleveParametreDeUrl('rapportTeleversement');
      await supprimeTeleversementEnCours();
      etatReseau = 'IMPORT_FINI';
      tiroirStore.afficheContenu(TiroirTeleversementModeleMesureSpecifique, {});
      enleveParametreDeUrl('rapportTeleversement');
    }}
    on:annule={async () => {
      etatReseau = 'IMPORT_FINI';
      enleveParametreDeUrl('rapportTeleversement');
      await supprimeTeleversementEnCours();
    }}
  >
    <table slot="tableau-du-rapport">
      <thead>
        <tr>
          <th scope="colgroup">État</th>
          <th scope="colgroup" class="bordure-droite">Raison de l'erreur</th>
          <th>Ligne</th>
          <th>Intitulé de la mesure</th>
          <th>Description de la mesure</th>
          <th>Catégorie</th>
        </tr>
      </thead>
      <tbody>
        {#each rapport.modelesTeleverses.toSorted(triRapportDetaille) as ligne, idx (idx)}
          <LigneDeRapport {ligne} />
        {/each}
      </tbody>
    </table>
  </RapportTeleversementGenerique>
{:else if etatReseau === 'IMPORT_EN_COURS'}
  <ModaleDeProgression
    delaiRafraichissement={50}
    apiGetProgression={async () => await fausseProgression()}
    on:fini={async () => {
      const nb = rapport.modelesTeleverses.length;
      toasterStore.succes(
        singulierPluriel(
          '1 mesure importée avec succès',
          `${nb} mesures importées avec succès`,
          nb
        ),
        `Vous avez importé ${nb} ${singulierPluriel(
          'mesure',
          'mesures',
          nb
        )} dans votre liste de mesures ajoutées.`
      );

      await modelesMesureSpecifique.rafraichis();
      await servicesAvecMesuresAssociees.rafraichis();

      etatReseau = 'IMPORT_FINI';
    }}
  />
{/if}
