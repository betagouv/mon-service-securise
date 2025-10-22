<script lang="ts">
  export let ongletActif: 'informations' | 'besoinsSecurite';
</script>

<div class="conteneur-onglets">
  <button
    on:click={() => (ongletActif = 'informations')}
    class:actif={ongletActif === 'informations'}
  >
    Informations sur le service
  </button>
  <button
    on:click={() => (ongletActif = 'besoinsSecurite')}
    class:actif={ongletActif === 'besoinsSecurite'}
  >
    Besoins de sécurité
  </button>
</div>

<style lang="scss">
  .conteneur-onglets {
    display: flex;
    flex-direction: row;
    max-width: 1000px;
    margin: 24px auto 0;
    border-bottom: 2px solid #ddd;

    button {
      background: none;
      border: none;
      font-size: 0.875rem;
      line-height: 1.5rem;
      cursor: pointer;
      padding: 12px 12px 10px 12px;
      transform: translateY(2px);
      border-bottom: 2px solid transparent;

      &.actif {
        color: #000091;
        border-bottom: 2px solid #000091;
      }
    }
  }
</style>
