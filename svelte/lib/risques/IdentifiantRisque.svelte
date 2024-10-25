<script lang="ts">
  import type { Risque } from './risques.d';

  export let risque: Risque;

  $: libelle =
    risque.type === 'GENERAL'
      ? `Risque ${risque.identifiantNumerique.substring(1)} (${
          risque.identifiantNumerique
        })`
      : `Risque spécifique ${risque.identifiantNumerique.substring(2)}`;
</script>

<span class={`identifiant-numerique ${risque.niveauRisque || ''}`}>
  {libelle}
</span>

<style>
  .identifiant-numerique {
    font-size: 14px;
    font-weight: 700;
    line-height: 20px;
    display: flex;
    padding: 1px 8px 3px;
    align-items: center;
    gap: 4px;
    border-radius: 40px;
    border: 1.5px solid var(--couleur-identifiant-numerique);
    width: fit-content;
    color: var(--couleur-identifiant-numerique);
    background: white;
    white-space: nowrap;
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
