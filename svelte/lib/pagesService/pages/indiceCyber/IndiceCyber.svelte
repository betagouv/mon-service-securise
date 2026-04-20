<script lang="ts">
  const configurationsTabs = [
    {
      id: 'indice-cyber-anssi',
      label: 'Indice cyber ANSSI',
    },
    {
      id: 'indice-cyber-personnalise',
      label: 'Indice cyber personnalisé',
    },
  ];
</script>

<div class="conteneur-indice-cyber">
  <dsfr-tabs tabs={configurationsTabs}>
    <div slot="panel-1" class="conteneur-onglet"></div>
  </dsfr-tabs>
</div>

<style lang="scss">
</style>
