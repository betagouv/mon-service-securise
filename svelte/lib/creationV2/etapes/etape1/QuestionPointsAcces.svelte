<script lang="ts">
  import { onMount, tick } from 'svelte';
  import type { MiseAJour } from '../../creationV2.api';
  import { leBrouillon } from '../brouillon.store';
  import ListeChampTexte from '../ListeChampTexte.svelte';

  interface Props {
    estComplete: boolean;
    onChampModifie: (miseAJour: MiseAJour) => void;
  }

  let { estComplete = $bindable(), onChampModifie }: Props = $props();

  onMount(() => {
    // Force la présence d'au moins un point, pour avoir une UI agréable qui montre un champ
    if ($leBrouillon.pointsAcces.length === 0) ajouteValeur();
  });

  $effect(() => {
    estComplete =
      $leBrouillon.pointsAcces.length === 0 ||
      $leBrouillon.pointsAcces.every((p) => p.length <= 200);
  });

  const supprimeValeur = (index: number) => {
    $leBrouillon.pointsAcces = $leBrouillon.pointsAcces.filter(
      (_, i) => i !== index
    );
  };

  const ajouteValeur = () => {
    $leBrouillon.pointsAcces = [...$leBrouillon.pointsAcces, ''];
  };

  const enregistre = () => {
    onChampModifie({
      pointsAcces: $leBrouillon.pointsAcces.filter(
        (pointAcces) => pointAcces.trim().length > 0
      ),
    });
  };
</script>

<label for="pointsAcces" class="titre-question">
  Quelle est l'URL de votre service?

  <span class="sous-titre"> exemple : https://www.exemple.com </span>
</label>
<div class="liste">
  <ListeChampTexte
    nomGroupe="pointsAcces"
    bind:valeurs={$leBrouillon.pointsAcces}
    onAjout={ajouteValeur}
    titreSuppression="Supprimer l'URL"
    titreAjout="Ajouter une URL"
    limiteTaille={200}
    onblur={() => enregistre()}
    onSuppression={async (index) => {
      supprimeValeur(index);
      await tick();
      if (estComplete) enregistre();
    }}
  />
</div>

<style lang="scss">
  .sous-titre {
    font-size: 0.75rem;
    line-height: 1.25rem;
    color: #666;
    font-weight: 400;
    margin-bottom: -8px;
    margin-top: 8px;
  }

  .liste {
    max-width: 586px;
    display: flex;
    flex-direction: column;
    gap: 16px;
  }
</style>
