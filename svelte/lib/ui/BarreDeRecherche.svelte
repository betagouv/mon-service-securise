<script lang="ts">
  export let recherche: string;
  export let taille: 'moyen' | 'grand' = 'moyen';
  export let desactive: boolean = false;

  const supprimeRecherche = () => {
    recherche = '';
  };
</script>

<div role="search" class={taille} class:desactive>
  <input
    type="search"
    placeholder="Rechercher"
    bind:value={recherche}
    disabled={desactive}
  />
  {#if recherche && !desactive}
    <button class="suppression-recherche" on:click={supprimeRecherche}>
      <img
        src="/statique/assets/images/ui-kit/suppression_champ.svg"
        alt="Suppression de la recherche"
      />
    </button>
  {/if}
  <button class="conteneur-icone" on:click disabled={desactive}>
    <img
      src="/statique/assets/images/icone_loupe.svg"
      alt="Icône de recherche"
    />
    {#if taille === 'grand'}
      <span>Rechercher</span>
    {/if}
  </button>
</div>

<style>
  div[role='search'] {
    display: flex;
    flex-direction: row;
    gap: 0;
    position: relative;
  }

  div[role='search'].moyen {
    width: 328px;
  }

  div[role='search'].grand {
    width: 792px;
  }

  div[role='search']:hover .conteneur-icone {
    background: var(--btn-primaire-survol);
  }

  input[type='search'] {
    padding: 8px 16px;
    font-family: 'Marianne';
    font-size: 16px;
    font-weight: 400;
    line-height: 24px;
    border: none;
    border-radius: 4px 0 0 0;
    border-top: 1px solid var(--systeme-design-etat-contour-champs);
    border-left: 1px solid var(--systeme-design-etat-contour-champs);
    border-bottom: 2px solid var(--bleu-mise-en-avant);
    width: 100%;
  }

  input[type='search']::-webkit-search-cancel-button {
    -webkit-appearance: none;
    appearance: none;
  }

  input[type='search']::placeholder {
    font-style: italic;
    color: #666666;
  }

  input[type='search']:focus-visible {
    outline: 2px solid var(--bleu-mise-en-avant);
    outline-offset: 2px;
  }

  input[type='search']:disabled {
    cursor: not-allowed;
    border: 1px solid var(--fond-gris-fonce);
    border-right: none;
  }

  input[type='search']:disabled::placeholder {
    color: var(--gris-inactif);
  }

  .conteneur-icone {
    display: flex;
    padding: 8px;
    justify-content: center;
    align-items: center;
    border-radius: 0 4px 0 0;
    background: var(--bleu-mise-en-avant);
    border: none;
    cursor: pointer;
  }

  div[role='search'] .conteneur-icone:active {
    background: var(--btn-primaire-clique);
  }

  div[role='search'] .conteneur-icone:disabled {
    cursor: not-allowed;
    background: var(--fond-gris-fonce);
  }

  div[role='search'].grand .conteneur-icone {
    padding: 10px 24px 10px 18px;
    justify-content: center;
    align-items: center;
    gap: 8px;
    color: white;
    font-size: 18px;
    font-weight: 500;
    line-height: 28px;
  }

  .suppression-recherche {
    border: none;
    background: none;
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    position: absolute;
    top: 13px;
    right: 56px;
    padding: 0;
  }

  div[role='search'].grand .suppression-recherche {
    right: 190px;
    top: 17px;
  }
</style>
