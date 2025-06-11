<script lang="ts">
  export let contenu: string;
  export let active: boolean = false;
</script>

<span class="pastille" class:active>
  {contenu}
</span>

<style lang="scss">
  .pastille {
    display: flex;
    width: fit-content;
    min-width: 0.75rem;
    height: 1rem;
    padding: 2px 4px;
    justify-content: center;
    align-items: center;
    border-radius: 12px;
    border: 1px solid white;
    color: var(--texte-clair);
    background: var(--fond-gris-pale);
    font-size: 0.75rem;
    line-height: 1.25rem;
    font-weight: 400;

    &.active {
      background: var(--bleu-mise-en-avant);
      color: white;
      border-color: transparent;
    }
  }
</style>
