<script lang="ts">
  export let libelle: string;
  export let requis: boolean = false;
</script>

<label>
  <span class:requis class="libelle">{libelle}</span>
  <span class="contenu">
    <slot />
  </span>
</label>

<style>
  .contenu {
    margin-top: 4px;
    display: flex;
    flex-direction: column;
  }

  label {
    display: flex;
    flex-direction: column;
    gap: 16px;
    font-weight: normal;
    margin: 0;
  }

  .libelle {
    font-weight: bold;
    font-size: 1rem;
    line-height: 1.375rem;
  }

  .requis:before {
    content: '*';
    color: #e3271c;
    margin-right: 4px;
    font-size: 1rem;
  }
</style>
