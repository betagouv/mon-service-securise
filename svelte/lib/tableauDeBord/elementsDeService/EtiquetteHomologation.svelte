<script lang="ts">
  export let statutHomologation: string;
  export let label: string;
  export let idService: string;
</script>

<a class={statutHomologation} href="/service/{idService}/dossiers">
  {label}
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
    --fond: #e9ddff;
    --fond-hover: #d4bcff;
    --fond-actif: #c19eff;
  }

  .bientotActivee {
    --fond: #eaf5ff;
    --fond-hover: #b6cffb;
    --fond-actif: #7badef;
  }

  .activee {
    --fond: #defbe5;
    --fond-hover: #c0edcb;
    --fond-actif: #a2ddb1;
  }
</style>
