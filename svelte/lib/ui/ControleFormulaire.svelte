<script lang="ts">
  export let libelle: string;
  export let sousTitre: string = '';
  export let requis: boolean = false;
</script>

<label>
  <span class:requis>{libelle}</span>
  {#if sousTitre}<span class="sousTitre">{sousTitre}</span>{/if}
  <span class="contenu">
    <slot />
  </span>
</label>

<style>
  .contenu {
    margin-top: 4px;
  }

  label {
    margin-bottom: 24px;
    display: flex;
    flex-direction: column;
    gap: 4px;
    font-weight: normal;
  }

  .sousTitre {
    color: var(--texte-clair);
    font-size: 0.75rem;
    line-height: 1.25rem;
  }

  .requis:before {
    content: '*';
    color: #e3271c;
    margin-right: 4px;
    font-size: 1rem;
  }
</style>
