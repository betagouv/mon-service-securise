<script lang="ts">
  export let recherche: string;
  export let taille: 'moyen' | 'grand' = 'moyen';
</script>

<div role="search" class={taille}>
  <input type="search" placeholder="Rechercher" bind:value={recherche} />
  <div class="conteneur-icone">
    <img
      src="/statique/assets/images/icone_loupe.svg"
      alt="Icône de recherche"
    />
    {#if taille === 'grand'}
      <span>Rechercher</span>
    {/if}
  </div>
</div>

<style>
  div[role='search'] {
    display: flex;
    flex-direction: row;
    gap: 0;
  }

  div[role='search'].moyen {
    width: 328px;
  }

  div[role='search'].grand {
    width: 792px;
  }

  input[type='search'] {
    padding: 8px 16px;
    font-family: 'Marianne';
    font-size: 16px;
    font-weight: 400;
    line-height: 24px;
    border: none;
    border-bottom: 2px solid var(--bleu-mise-en-avant);
    width: 100%;
  }

  input[type='search']::placeholder {
    font-style: italic;
    color: #666666;
  }

  input[type='search']:focus-visible {
    outline: 2px solid var(--bleu-mise-en-avant);
  }

  .conteneur-icone {
    display: flex;
    padding: 8px;
    justify-content: center;
    align-items: center;
    border-radius: 0 4px 0 0;
    background: var(--bleu-mise-en-avant);
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

  input[type='search']:focus-visible ~ .conteneur-icone {
    outline: 2px solid var(--bleu-mise-en-avant);
  }
</style>
