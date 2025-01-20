<script lang="ts">
  export let statutHomologation: string;
  export let label: string;
  export let idService: string;
  export let dateExpiration: string = '';
</script>

<a
  class={statutHomologation + ' statut-homologation-service'}
  href="/service/{idService}/dossiers"
>
  {label}
  {#if statutHomologation === 'bientotExpiree'}
    {dateExpiration}
  {/if}
</a>

<style>
  a {
    padding: 2px 8px;
    border-radius: 12px;
    font-size: 12px;
    font-weight: 400;
    line-height: 20px;
    background: var(--fond);
    color: var(--texte-fonce);
    white-space: nowrap;
  }

  a:hover {
    background: var(--fond-hover);
  }

  a:active {
    background: var(--fond-actif);
  }

  .expiree {
    --fond: #ffe9e9;
    --fond-hover: #ffdbdb;
    --fond-actif: #ffbdbd;
  }

  .bientotExpiree {
    --fond: #fff2de;
    --fond-hover: #ffe3ba;
    --fond-actif: #f9ce8e;
  }

  .nonRealisee {
    --fond: #e6ebf1;
    --fond-hover: #e6ebf1;
    --fond-actif: #dadfe6;
  }

  .activee {
    --fond: #defbe5;
    --fond-hover: #c0edcb;
    --fond-actif: #a2ddb1;
  }
</style>
