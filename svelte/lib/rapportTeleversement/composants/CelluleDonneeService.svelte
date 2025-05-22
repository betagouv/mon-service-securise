<script lang="ts">
  export let contenu: string;
  export let enErreur: boolean = false;
  export let large: boolean = false;
  export let dernier: boolean = false;
  export let gras: boolean = false;
</script>

<td class:enErreur class:large class:dernier class:gras>{contenu || '-'}</td>

<style lang="scss">
  td {
    font-size: 0.875rem;
    line-height: 1.5rem;
    padding: 8px 16px;
    max-width: 188px;
    text-align: left;
    border-top: 1px solid var(--systeme-design-etat-contour-champs);
    border-bottom: 1px solid var(--systeme-design-etat-contour-champs);
    color: #3a3a3a;
  }

  .enErreur {
    color: var(--erreur-texte);
    font-weight: 700;
  }

  .large {
    min-width: 200px;
  }

  .dernier {
    border-right: 1px solid var(--systeme-design-etat-contour-champs);
  }

  .gras {
    font-weight: 700;
  }
</style>
