<script lang="ts">
  interface Props {
    icone: 'data_visualization' | 'success' | 'data_security';
    chiffre: number | string;
    description: string;
  }

  let { icone, chiffre, description }: Props = $props();
</script>

<div class="carte-chiffre">
  <img
    src="/statique/assets/images/illustration_{icone}.svg"
    alt="Illustration de l'indice cyber moyen"
  />
  <div>
    <span class="chiffre-carte">{chiffre}</span>
    <span class="chiffre-carte-description">{description}</span>
  </div>
</div>

<style lang="scss">
  .carte-chiffre {
    display: flex;
    flex-direction: column;
    gap: 16px;
    padding: 32px;
    border-radius: 4px;
    border: 1px solid #ddd;
    justify-content: center;
    align-items: center;

    img {
      max-width: 80px;
    }

    & > div {
      display: flex;
      flex-direction: column;

      .chiffre-carte {
        color: #161616;
        text-align: center;
        font-size: 1.25rem;
        font-weight: 700;
        line-height: 1.75rem;
      }

      .chiffre-carte-description {
        color: #666;
        text-align: center;
        font-size: 1rem;
        font-weight: 400;
        line-height: 1.5rem;
      }
    }
  }
</style>
