<script lang="ts">
  import Tableau from '../../ui/Tableau.svelte';
  import type { Risque } from '../risquesV2.d';
  import CartoucheIdentifiantRisque from '../kit/CartoucheIdentifiantRisque.svelte';

  interface Props {
    risques: Risque[];
  }

  let { risques }: Props = $props();
</script>

<Tableau
  colonnes={[
    { cle: 'identifiant', libelle: 'Identifiant' },
    { cle: 'intitule', libelle: 'Intitulé du risque' },
    { cle: 'statut', libelle: 'Statut' },
    { cle: 'actions', libelle: 'Actions' },
  ]}
  donnees={risques}
>
  {#snippet cellule({ donnee, colonne })}
    {#if colonne.cle === 'identifiant'}
      <div class="identifiant">
        <CartoucheIdentifiantRisque risque={donnee} />
      </div>
    {:else if colonne.cle === 'intitule'}
      <div class="intitule">
        {donnee.intitule}
      </div>
    {/if}
  {/snippet}
</Tableau>
