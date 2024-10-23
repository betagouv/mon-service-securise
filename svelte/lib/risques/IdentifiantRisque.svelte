<script lang="ts">
  import { niveauRisque } from './risques';
  import type { ReferentielGravites } from './risques.d';
  import type { ReferentielVraisemblances } from './risques.d';
  import type { Risque } from './risques.d';

  export let niveauxGravite: ReferentielGravites;
  export let niveauxVraisemblance: ReferentielVraisemblances;
  export let risque: Risque;

  $: niveau = niveauRisque(risque, niveauxVraisemblance, niveauxGravite);
</script>

<span class={`identifiant-numerique ${niveau || ''}`}>
  {risque.identifiantNumerique}
</span>

<style>
  .identifiant-numerique {
    font-size: 14px;
    font-weight: 700;
    line-height: 20px;
    display: flex;
    height: 24px;
    padding: 0 10px;
    align-items: center;
    gap: 4px;
    border-radius: 40px;
    border: 1.5px solid var(--couleur-identifiant-numerique);
    width: fit-content;
    color: var(--couleur-identifiant-numerique);
    --couleur-identifiant-numerique: var(--role-inconnu-texte);
  }

  .identifiant-numerique.faible {
    --couleur-identifiant-numerique: var(--role-personnalise-texte);
  }

  .identifiant-numerique.moyen {
    --couleur-identifiant-numerique: var(--role-proprietaire-texte);
  }

  .identifiant-numerique.eleve {
    --couleur-identifiant-numerique: var(--rose-anssi);
  }
</style>
