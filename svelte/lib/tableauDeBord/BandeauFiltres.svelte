<script lang="ts">
  import BarreDeRecherche from '../ui/BarreDeRecherche.svelte';
  import { rechercheTextuelle } from './stores/rechercheTextuelle.store';
  import { services } from './stores/services.store';
  import Lien from '../ui/Lien.svelte';
  import ListeDeroulanteRiche from '../ui/ListeDeroulanteRiche.svelte';
  import { filtrageServices } from './stores/filtrageServices.store';
</script>

<div class="conteneur-filtres">
  <div class="recherche">
    <BarreDeRecherche bind:recherche={$rechercheTextuelle} />
    <ListeDeroulanteRiche
      bind:valeursSelectionnees={$filtrageServices}
      id="filtres"
      libelle="Filtrer"
      options={{
        categories: [
          { id: 'niveauSecurite', libelle: 'Besoin de sécurité' },
          { id: 'indiceCyber', libelle: 'Indice cyber' },
          { id: 'propriete', libelle: 'Propriété' },
        ],
        items: [
          {
            libelle: 'Élémentaires',
            valeur: 'niveau1',
            idCategorie: 'niveauSecurite',
          },
          {
            libelle: 'Modérés',
            valeur: 'niveau2',
            idCategorie: 'niveauSecurite',
          },
          {
            libelle: 'Importants',
            valeur: 'niveau3',
            idCategorie: 'niveauSecurite',
          },
          {
            libelle: 'Inférieur à 1',
            valeur: '<1',
            idCategorie: 'indiceCyber',
          },
          {
            libelle: 'Entre 1 et 2',
            valeur: '1-2',
            idCategorie: 'indiceCyber',
          },
          {
            libelle: 'Entre 2 et 3',
            valeur: '2-3',
            idCategorie: 'indiceCyber',
          },
          {
            libelle: 'Entre 3 et 4',
            valeur: '3-4',
            idCategorie: 'indiceCyber',
          },
          {
            libelle: 'Entre 4 et 5',
            valeur: '4-5',
            idCategorie: 'indiceCyber',
          },
          {
            libelle: 'Je suis propriétaire du service',
            valeur: 'proprietaire',
            idCategorie: 'propriete',
          },
        ],
      }}
    />
  </div>
  {#if $services.length > 0}
    <Lien
      classe="nouveau-service"
      titre="Ajouter un service"
      type="bouton-primaire"
      icone="plus"
      href="/service/creation"
    />
  {/if}
</div>

<style>
  .conteneur-filtres {
    display: flex;
    flex-direction: row;
    justify-content: space-between;
  }

  .recherche {
    display: flex;
    flex-direction: row;
    gap: 12px;
  }
</style>
