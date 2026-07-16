<script lang="ts">
  import { derived } from 'svelte/store';
  import Lien from '../ui/Lien.svelte';
  import BoutonAvecListeDeroulante from '../ui/BoutonAvecListeDeroulante.svelte';
  import Infobulle from '../ui/Infobulle.svelte';
  import { storeVersionsDeService } from './mesureGenerale/modelesMesureGenerale.store';
  import { modelesMesureSpecifique } from '../ui/stores/modelesMesureSpecifique.store';
  import type { CapaciteAjoutDeMesure } from './listeMesures.d';

  interface Props {
    capaciteAjoutDeMesure: CapaciteAjoutDeMesure;
    onajouterunemesureclick: () => void;
    onteleverserdesmesuresclick: () => void;
  }

  let {
    capaciteAjoutDeMesure,
    onajouterunemesureclick,
    onteleverserdesmesuresclick,
  }: Props = $props();

  let peutAjouterModelesMesureSpecifique = derived(
    modelesMesureSpecifique,
    ($s) => $s.length < capaciteAjoutDeMesure.nombreMaximum
  );
</script>

<div class="conteneur-actions">
  <dsfr-toggle
    label="Afficher les référentiels d'exigences associés"
    id="affiche-referentiels-externes"
  ></dsfr-toggle>
  <div class="ligne-2">
    <Lien
      type="bouton-tertiaire"
      href="/mesures/export.csv?version={$storeVersionsDeService.versionSelectionnee}"
      titre="Télécharger la liste de mesures"
      target="_blank"
      icone="telecharger"
    />
    <div class="action-ajout-modeles-mesure-specifique">
      <BoutonAvecListeDeroulante
        titre="Ajouter une / des mesures"
        aligneADroite
        options={[
          {
            label: 'Ajouter une mesure',
            icone: 'add-line',
            action: onajouterunemesureclick,
          },
          {
            label: 'Téléverser des mesures',
            icone: 'upload-2-line',
            action: onteleverserdesmesuresclick,
          },
        ]}
        disabled={!$peutAjouterModelesMesureSpecifique}
      />
      {#if !$peutAjouterModelesMesureSpecifique}
        <Infobulle
          contenu="Vous avez atteint la limite maximale de ${capaciteAjoutDeMesure.nombreMaximum} mesures. Pour ajouter des mesures, veuillez d'abord en supprimer."
        />
      {/if}
    </div>
  </div>
</div>

<style lang="scss">
  /* <Tableau> est utilisé à au moins 8 endroits… pour ne pas casser l'existant,
   on vient modifier en flex-start seulement ici, via un global.
   */
  :global(.conteneur-tableau .filtres) {
    align-items: flex-start;
  }

  .conteneur-actions {
    display: flex;
    flex-direction: column;
    gap: 40px;
    padding-top: 8px;

    dsfr-toggle {
      width: fit-content;
      white-space: nowrap;
      margin-left: auto;
    }
  }

  .ligne-2 {
    margin-left: auto;
    display: flex;
    gap: 12px;

    .action-ajout-modeles-mesure-specifique {
      display: flex;
      align-items: center;
      gap: 4px;
    }
  }
</style>
