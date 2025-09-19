<script lang="ts">
  import { createEventDispatcher, onMount, tick } from 'svelte';
  import ChampTexte from '../../../ui/ChampTexte.svelte';
  import type { MiseAJour } from '../../creationV2.api';
  import { leBrouillon } from '../brouillon.store';

  export let estComplete: boolean;

  const emetEvenement = createEventDispatcher<{ champModifie: MiseAJour }>();

  onMount(() => {
    // Force la présence d'au moins un point, pour avoir une UI agréable qui montre un champ
    if ($leBrouillon.pointsAcces.length === 0) ajouteValeur();
  });

  // N'avoir aucun point d'accès est valide, donc on peut utiliser `every` qui renvoie `true` sur tableau vide.
  $: estComplete = $leBrouillon.pointsAcces.every((v) =>
    v ? v.trim().length > 0 : false
  );

  const supprimeValeur = (index: number) => {
    $leBrouillon.pointsAcces = $leBrouillon.pointsAcces.filter(
      (_, i) => i !== index
    );
  };

  const ajouteValeur = () => {
    $leBrouillon.pointsAcces = [...$leBrouillon.pointsAcces, ''];
  };

  const enregistre = () => {
    emetEvenement('champModifie', { pointsAcces: $leBrouillon.pointsAcces });
  };
</script>

<label for="presentation" class="titre-question">
  Quelle est l'URL de votre service?

  <span class="sous-titre"> exemple : https://www.exemple.com </span>
  {#each $leBrouillon.pointsAcces as url, index}
    <div class="conteneur-url">
      <ChampTexte
        id={`pointsAcces-${index}`}
        nom="pointsAcces"
        bind:valeur={url}
        on:blur={() => enregistre()}
      />
      <!-- svelte-ignore a11y-click-events-have-key-events a11y-no-static-element-interactions -->
      <lab-anssi-bouton
        titre="Supprimer l'URL"
        variante="tertiaire"
        taille="lg"
        icone="delete-line"
        positionIcone="seule"
        on:click={async () => {
          supprimeValeur(index);
          await tick();
          if (estComplete) enregistre();
        }}
      />
    </div>
  {/each}
  <div class="conteneur-actions">
    <!-- svelte-ignore a11y-click-events-have-key-events a11y-no-static-element-interactions -->
    <lab-anssi-bouton
      titre="Ajouter une URL"
      variante="tertiaire"
      taille="md"
      icone="add-line"
      positionIcone="gauche"
      on:click={() => ajouteValeur()}
    />
  </div>
</label>

<style lang="scss">
  .conteneur-url {
    display: flex;
    flex-direction: row;
    justify-content: space-between;
    gap: 8px;

    :global(input) {
      width: 100%;
    }
  }

  .conteneur-actions {
    width: fit-content;
  }

  .sous-titre {
    font-size: 0.75rem;
    line-height: 1.25rem;
    color: #666;
    font-weight: 400;
    margin-bottom: -8px;
    margin-top: 8px;
  }
</style>
