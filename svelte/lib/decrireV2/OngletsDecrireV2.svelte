<script lang="ts">
  interface Props {
    ongletActif: 'informations' | 'besoinsSecurite';
  }

  let { ongletActif = $bindable() }: Props = $props();
</script>

<div class="conteneur-onglets">
  <button
    onclick={() => (ongletActif = 'informations')}
    class:actif={ongletActif === 'informations'}
  >
    Informations sur le service
  </button>
  <button
    onclick={() => (ongletActif = 'besoinsSecurite')}
    class:actif={ongletActif === 'besoinsSecurite'}
  >
    Besoins de sécurité
  </button>
</div>

<style lang="scss">
  .conteneur-onglets {
    display: flex;
    flex-direction: row;
    margin: 24px 24px 0 72px;
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
