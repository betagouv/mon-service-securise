<script lang="ts">
  import type { Snippet } from 'svelte';

  export interface ChartProps {
    titre: string;
    baniereAvecChiffre?: {
      icone: 'internet';
      chiffre: number;
      description: string;
    };
  }

  interface Props extends ChartProps {
    children: Snippet;
  }

  let { titre, baniereAvecChiffre, children }: Props = $props();
</script>

<div class="graphique">
  <h2>{titre}</h2>
  {#if baniereAvecChiffre}
    <div class="baniere-avec-chiffre">
      <img
        src="/statique/assets/images/illustration_{baniereAvecChiffre.icone}.svg"
        alt="Illustration de {titre}"
      />
      <div>
        <span class="chiffre">{baniereAvecChiffre.chiffre}</span>
        <span class="description">{baniereAvecChiffre.description}</span>
      </div>
    </div>
  {/if}
  {@render children()}
</div>

<style lang="scss">
  .graphique {
    display: flex;
    flex-direction: column;
    gap: 24px;
    padding: 40px;
    border-radius: 4px;
    border: 1px solid #ddd;

    h2 {
      color: #282828;
      font-size: 1.25rem;
      font-weight: 700;
      line-height: 1.75rem;
      margin: 0;
    }

    .baniere-avec-chiffre {
      display: flex;
      flex-direction: row;
      gap: 12px;
      align-items: center;

      & > div {
        display: flex;
        flex-direction: column;

        .chiffre {
          color: #161616;
          font-size: 1.25rem;
          font-weight: 700;
          line-height: 1.75rem;
        }

        .description {
          color: #666;
          font-size: 1rem;
          font-weight: 400;
          line-height: 1.5rem;
        }
      }
    }
  }
</style>
