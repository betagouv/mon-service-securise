<script lang="ts">
  import type { Referentiel } from './types.d';

  export let referentiel: Referentiel;
</script>

<span>{referentiel}</span>

<style>
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
    font-size: 0.9em;
  }
</style>
