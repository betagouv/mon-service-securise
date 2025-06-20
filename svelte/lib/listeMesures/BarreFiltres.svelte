<script lang="ts">
  import BarreDeRecherche from '../ui/BarreDeRecherche.svelte';
  import ListeDeroulanteRiche from '../ui/ListeDeroulanteRiche.svelte';
  import { filtrageMesures } from './filtrageMesures.store';
  import { rechercheMesures } from './rechercheMesures.store';
  import { CategorieMesure, Referentiel } from '../ui/types.d';

  let itemsFiltre: { libelle: string; valeur: string; idCategorie: string }[] =
    [
      {
        libelle: 'ANSSI',
        valeur: Referentiel.ANSSI,
        idCategorie: 'referentiel',
      },
      {
        libelle: 'CNIL',
        valeur: Referentiel.CNIL,
        idCategorie: 'referentiel',
      },
      {
        libelle: 'Défense',
        valeur: CategorieMesure.DEFENSE,
        idCategorie: 'categories',
      },
      {
        libelle: 'Gouvernance',
        valeur: CategorieMesure.GOUVERNANCE,
        idCategorie: 'categories',
      },
      {
        libelle: 'Protection',
        valeur: CategorieMesure.PROTECTION,
        idCategorie: 'categories',
      },
      {
        libelle: 'Résilience',
        valeur: CategorieMesure.RESILIENCE,
        idCategorie: 'categories',
      },
    ];
</script>

<div class="filtres">
  <BarreDeRecherche bind:recherche={$rechercheMesures} />
  <ListeDeroulanteRiche
    bind:valeursSelectionnees={$filtrageMesures}
    id="filtres"
    libelle="Filtrer"
    options={{
      categories: [
        { id: 'referentiel', libelle: 'Référentiel' },
        { id: 'categories', libelle: 'Catégories' },
      ],
      items: itemsFiltre,
    }}
  />
</div>

<style lang="scss">
  .filtres {
    display: flex;
    flex-direction: row;
    gap: 12px;
  }
</style>
