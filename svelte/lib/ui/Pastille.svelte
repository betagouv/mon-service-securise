<script lang="ts">
  interface Props {
    contenu: string;
    active?: boolean;
  }

  let { contenu, active = false }: Props = $props();
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
    color: #161616;
    background: white;
    font-size: 0.75rem;
    line-height: 1rem;
    font-weight: 400;

    &.active {
      background: var(--bleu-mise-en-avant);
      color: white;
    }
  }
</style>
