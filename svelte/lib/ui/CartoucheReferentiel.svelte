<script lang="ts">
  import type { Referentiel } from './types.d';

  interface Props {
    referentiel: Referentiel;
  }

  let { referentiel }: Props = $props();
</script>

<span class={referentiel.toLowerCase().replaceAll(' ', '-')}>{referentiel}</span
>

<style lang="scss">
  span {
    border-radius: 40px;
    padding: 1px 8px 3px;
    font-weight: 500;
    display: flex;
    white-space: nowrap;
    align-items: center;
    justify-content: center;
    width: fit-content;
    color: var(--bleu-survol);
    background: #f1f5f9;
    font-size: 0.75rem;
    line-height: 1.25rem;

    &.mesures-ajoutées {
      color: var(--bleu-mise-en-avant);
    }
  }
</style>
