<script lang="ts">
  import type { Risque } from './risquesV2.d';

  export let risques: Risque[];
  export let transparent: boolean = false;
</script>

<table class="relatif" class:transparent>
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
          {@const niveauRisque = gravite * vraisemblance}
          {@const couleur =
            niveauRisque <= 4 && vraisemblance < 3 && gravite < 4
              ? 'vert'
              : niveauRisque >= 8 && vraisemblance > 2 && gravite >= 2
              ? 'rouge'
              : 'orange'}
          {@const risqueDeCetteCellule = risques.filter(
            (r) => r.gravite === gravite && r.vraisemblance === vraisemblance
          )}
          {@const idRisques = risqueDeCetteCellule.map((r) => r.id).join(', ')}
          <td>
            <div class="contenu-cellule {couleur}">
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

<style lang="scss">
  table {
    border-collapse: collapse;
    --bordure: #929292;
    --rouge: #e1000f;
    --orange: #fa7a35;
    --vert: #77b645;

    &.transparent {
      --bordure: transparent;
      --rouge: transparent;
      --orange: transparent;
      --vert: transparent;
    }

    th {
      color: #929292;
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
          width: 123px;
          height: 72px;
          color: #fff;
          font-size: 1rem;
          font-weight: bold;
          line-height: 1.5rem;
          display: flex;
          align-items: center;
          justify-content: center;

          &.vert {
            background: var(--vert);
          }

          &.orange {
            background: var(--orange);
          }

          &.rouge {
            background: var(--rouge);
          }
        }
      }
    }

    .legende-x {
      th:not([aria-hidden='true']) {
        border-top: 2px solid var(--bordure);
      }
    }
  }

  .legende {
    position: absolute;
    top: 12px;
    left: 12px;
    transform: translateX(-100%) translateY(-100%);
    color: #929292;
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

  .relatif {
    position: relative;
  }
</style>
