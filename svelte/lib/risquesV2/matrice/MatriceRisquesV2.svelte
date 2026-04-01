<script lang="ts">
  import type { Risque } from '../risquesV2.d';
  import { couleur } from '../kit/kit';

  interface Props {
    risques: Risque[];
    enAttenteCompletionMesures?: boolean;
    transparent?: boolean;
    taille?: 'sm' | 'md';
  }

  let {
    risques,
    enAttenteCompletionMesures = false,
    transparent = false,
    taille = 'md',
  }: Props = $props();
</script>

<div class="relatif">
  <table
    class="relatif"
    class:transparent
    class:en-attente={enAttenteCompletionMesures}
  >
    {#if !transparent}
      <caption class="legende"><span>Gravité</span></caption>
      <caption class="legende bas-droite"><span>Vraisemblance</span></caption>
    {/if}
    <tbody>
      {#each new Array(4).fill(0) as _ligne, indexLigne (indexLigne)}
        {@const gravite = indexLigne * -1 + 4}
        <tr>
          <th scope="row">
            <span>{indexLigne * -1 + 4}</span>
          </th>
          {#each new Array(4).fill(0) as _colonne, indexColonne (indexColonne)}
            {@const vraisemblance = indexColonne + 1}
            {@const laCouleur = couleur(gravite, vraisemblance)}
            {@const risqueDeCetteCellule = risques.filter(
              (r) =>
                !r.desactive &&
                r.gravite === gravite &&
                r.vraisemblance === vraisemblance
            )}
            {@const idRisques = risqueDeCetteCellule
              .map((r) => r.id)
              .join(', ')}
            <td>
              <div
                class="contenu-cellule {laCouleur} {taille}"
                class:en-attente={enAttenteCompletionMesures}
              >
                {#if idRisques}
                  <span>{idRisques}</span>
                {/if}
              </div>
            </td>
          {/each}
        </tr>
      {/each}
      <tr class="legende-x">
        <th aria-hidden="true"></th>
        {#each new Array(4).fill(0) as _colonne, indexColonne (indexColonne)}
          <th scope="col">
            <span>{indexColonne + 1}</span>
          </th>
        {/each}
      </tr>
    </tbody>
  </table>
  {#if enAttenteCompletionMesures}
    <dsfr-alert
      has-description
      text="En attente de complétion des mesures"
      type="info"
      size="sm"
    ></dsfr-alert>
  {/if}
</div>

<style lang="scss">
  table {
    border-collapse: collapse;
    --bordure: #929292;
    --rouge: #e1000f;
    --orange: #fa7a35;
    --vert: #77b645;

    &.en-attente {
      --bordure: #dddddd;
    }

    &.transparent {
      --bordure: transparent;
      --rouge: transparent;
      --orange: transparent;
      --vert: transparent;
    }

    th {
      color: var(--bordure);
      font-size: 1rem;
      font-weight: 400;
      line-height: 1.5rem;

      span {
        margin-right: 10px;
      }
    }

    tr {
      td {
        padding: 2.5px;
        border-top: 2px dashed var(--bordure);

        &:first-of-type {
          border-left: 2px solid var(--bordure);
          padding-left: 6px;
        }

        .contenu-cellule {
          color: #fff;
          font-size: 0.875rem;
          font-weight: bold;
          line-height: 1rem;
          display: flex;
          align-items: center;
          justify-content: center;

          &.md {
            width: 123px;
            height: 72px;
          }

          &.sm {
            width: 107px;
            height: 63px;
          }

          &.vert {
            background: var(--vert);
          }

          &.orange {
            background: var(--orange);
          }

          &.rouge {
            background: var(--rouge);
          }

          &.en-attente {
            background: #f6f6f6;
          }
        }
      }
    }

    .legende-x {
      th:not([aria-hidden='true']) {
        border-top: 2px solid var(--bordure);
      }
    }

    .legende {
      position: absolute;
      top: 12px;
      left: 12px;
      transform: translateX(-100%) translateY(-100%);
      color: var(--bordure);
      font-size: 1rem;
      line-height: 1.5rem;

      &.bas-droite {
        top: unset;
        left: unset;
        bottom: 0;
        right: 12px;
        transform: translateX(100%);
      }
    }
  }

  dsfr-alert {
    position: absolute;
    top: 35%;
    left: 14%;
    text-align: left;
    background: white;
    max-width: 300px;
  }

  .relatif {
    position: relative;
  }
</style>
