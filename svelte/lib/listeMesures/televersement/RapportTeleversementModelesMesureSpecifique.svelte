<script lang="ts">
  import { onMount } from 'svelte';
  import {
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

    resume = {
      elementsValide: nbOK ? { label: labelOK } : null,
      elementsErreur: erreurs ? { label: labelErreurs } : null,
      statut: rapport.statut,
      labelValiderTeleversement: singulierPluriel(
        'Importer la mesure',
        `Importer les ${nbOK} mesures`,
        nbOK
      ),
    };

    etatReseau = 'RAPPORT_OBTENU';
  });
</script>

{#if etatReseau === 'RAPPORT_OBTENU'}
  <RapportTeleversementGenerique
    titreDuRapport="Rapport du téléversement des mesures"
    {resume}
    on:confirmeTeleversement={() => {
      console.log('✅ Confirmé');
    }}
    on:retenteTeleversement={async () => {
      await supprimeTeleversementEnCours();
      etatReseau = 'IMPORT_FINI';
      tiroirStore.afficheContenu(TiroirTeleversementModeleMesureSpecifique, {});
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
{/if}
