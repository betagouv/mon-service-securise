<script lang="ts">
  import {
    type ReferentielGravites,
    type ReferentielVraisemblances,
    type Risque,
  } from './risques.d';
  import { niveauRisqueCellule } from './risques';

  export let risques: Risque[];
  export let niveauxGravite: ReferentielGravites;
  export let niveauxVraisemblance: ReferentielVraisemblances;

  type Cellule = Risque[] | null;

  const positionVraisemblance = (risque: Risque) =>
    niveauxVraisemblance[risque.niveauVraisemblance].position;

  const positionGravite = (risque: Risque) =>
    niveauxGravite[risque.niveauGravite].position;

  const calculeGrille = (risques: Risque[]) => {
    const resultat: Cellule[][] = Array.from({ length: 4 }, () =>
      Array(4).fill(null)
    );

    const risquesCartographies = risques.filter(
      (risque) =>
        risque.niveauGravite &&
        risque.niveauVraisemblance &&
        positionVraisemblance(risque) > 0 &&
        positionGravite(risque) > 0
    );

    risquesCartographies.forEach((risque) => {
      const x = positionVraisemblance(risque) - 1;
      const y = Math.abs(4 - positionGravite(risque));
      resultat[y][x] = resultat[y][x] || [];
      resultat[y][x].push(risque);
    });
    return resultat;
  };
  $: grille = calculeGrille(risques);
</script>

<div class="matrice">
  <span class="legende legende-y">Gravité</span>
  <span class="legende legende-x">Vraissemblance</span>
  <div class="axe axe-y">
    <span>4</span>
    <span>3</span>
    <span>2</span>
    <span>1</span>
  </div>
  <div class="axe axe-x">
    <span>1</span>
    <span>2</span>
    <span>3</span>
    <span>4</span>
  </div>
  <div class="conteneur-matrice">
    {#each new Array(16).fill(0) as _, index}
      {@const x = index % 4}
      {@const y = Math.floor(index / 4)}
      {@const classe = niveauRisqueCellule(x, y)}
      {@const risquesPresent = grille[y][x]}
      <div class="cellule-matrice {classe}">
        {risquesPresent
          ? risquesPresent.map((r) => r.identifiantNumerique).join(', ')
          : ''}
      </div>
    {/each}
  </div>
</div>

<style>
  .matrice {
    position: relative;
    width: fit-content;
  }

  .legende {
    position: absolute;
    color: var(--texte-clair);
    font-size: 10px;
    font-weight: 400;
  }

  .legende-y {
    top: 0;
    left: -46px;
  }

  .legende-x {
    bottom: -20px;
    right: -28px;
  }

  .conteneur-matrice {
    display: grid;
    grid-template-columns: repeat(4, 81px);
    column-gap: 3px;
    grid-template-rows: repeat(4, 35px);
    row-gap: 2px;
    padding: 15px 13px 6px 6px;
    border-bottom: 1px solid var(--liseres-fonce);
    border-left: 1px solid var(--liseres-fonce);
    width: fit-content;
    position: relative;
  }

  .conteneur-matrice::before {
    content: '';
    width: 4px;
    height: 4px;
    border-top: 1px solid var(--liseres-fonce);
    border-left: 1px solid var(--liseres-fonce);
    transform: rotate(45deg);
    position: absolute;
    top: 0;
    left: -3px;
  }

  .conteneur-matrice::after {
    content: '';
    width: 4px;
    height: 4px;
    border-top: 1px solid var(--liseres-fonce);
    border-left: 1px solid var(--liseres-fonce);
    transform: rotate(135deg);
    position: absolute;
    bottom: -3px;
    right: 0;
  }

  .axe {
    position: absolute;
    display: flex;
  }

  .axe span {
    font-size: 8px;
    font-weight: 400;
  }

  .axe-y {
    left: -16px;
    flex-direction: column;
    gap: 26px;
    top: 38px;
  }

  .axe-x {
    bottom: -18px;
    left: 40px;
    flex-direction: row;
    gap: 80px;
  }

  .cellule-matrice {
    display: flex;
    align-items: center;
    justify-content: center;
    background: var(--couleur-fond);
    font-size: 10px;
    font-weight: 700;
    line-height: 16px;
    color: white;
    text-align: center;
  }

  .cellule-matrice.faible {
    --couleur-fond: #4cb963;
  }

  .cellule-matrice.moyen {
    --couleur-fond: #faa72c;
  }

  .cellule-matrice.eleve {
    --couleur-fond: #e32630;
  }
</style>
