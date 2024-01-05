<script lang="ts">
  import type { Referentiel } from './types.d';

  export let referentiel: Referentiel;
</script>

<span>{referentiel}</span>

<style>
  span {
    border-radius: 40px;
    padding: 4px 10px;
    font-weight: 500;
    display: flex;
    align-items: center;
    justify-content: center;
    width: fit-content;
    color: #08416a;
    background: #f1f5f9;
  }
</style>
