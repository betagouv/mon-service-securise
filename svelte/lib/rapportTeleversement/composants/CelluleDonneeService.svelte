<script lang="ts">
  export let donnee: string;
  export let enErreur: boolean = false;
  export let large: boolean = false;
  export let dernier: boolean = false;
</script>

<td class:enErreur class:large class:dernier>{donnee || '-'}</td>

<style lang="scss">
  td {
    font-size: 0.875rem;
    line-height: 1.5rem;
    padding: 8px 16px;
    max-width: 188px;
    text-align: left;
    border-top: 1px solid #dddddd;
    border-bottom: 1px solid #dddddd;
  }

  .enErreur {
    color: var(--erreur-texte);
    font-weight: 700;
  }

  .large {
    min-width: 200px;
  }

  .dernier {
    border-right: 1px solid #dddddd;
  }
</style>
