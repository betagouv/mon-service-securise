<script lang="ts">
  import BarreDeRecherche from '../ui/BarreDeRecherche.svelte';
  import { rechercheTextuelle } from './stores/rechercheTextuelle.store';
  import { services } from './stores/services.store';
  import ListeDeroulanteRiche from '../ui/ListeDeroulanteRiche.svelte';
  import { filtrageServices } from './stores/filtrageServices.store';
  import BoutonAvecListeDeroulante from '../ui/BoutonAvecListeDeroulante.svelte';
  import { tiroirStore } from '../ui/stores/tiroir.store';
  import Lien from '../ui/Lien.svelte';
  import { referentielNiveauxSecurite } from '../ui/referentielNiveauxSecurite';
  import { brouillonsService } from './stores/brouillonsService.store';
  import TiroirTeleversementServicesV2 from './televersementServices/TiroirTeleversementServicesV2.svelte';
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
          { id: 'completude', libelle: 'Complétion' },
        ],
        items: [
          ...Object.entries(referentielNiveauxSecurite).map(
            ([valeur, libelle]) => ({
              libelle,
              valeur,
              idCategorie: 'niveauSecurite',
            })
          ),
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
          {
            libelle: 'Inférieur à 50%',
            valeur: '<50%',
            idCategorie: 'completude',
          },
          {
            libelle: 'Entre 50% et 80%',
            valeur: '50%-80%',
            idCategorie: 'completude',
          },
          {
            libelle: 'Supérieur à 80%',
            valeur: '>80%',
            idCategorie: 'completude',
          },
        ],
      }}
    />
  </div>
  <div class="actions">
    <Lien
      type="bouton-tertiaire"
      href="/mesures"
      titre="Liste de mesures"
      taille="moyen"
      icone="ajout-liste"
    />
    {#if $services.length > 0 || $brouillonsService.length > 0}
      <BoutonAvecListeDeroulante
        titre="Ajouter un / des services"
        options={[
          {
            label: 'Ajouter un service',
            icone: 'plus',
            href: '/service/v2/creation',
          },
          {
            label: 'Téléverser des services',
            icone: 'televerser',
            action: () =>
              tiroirStore.afficheContenu(TiroirTeleversementServicesV2, {}),
          },
        ]}
      />
    {/if}
  </div>
</div>

<style>
  .conteneur-filtres {
    display: flex;
    flex-direction: row;
    justify-content: space-between;
    position: sticky;
    padding-top: 8px;
    padding-bottom: 32px;
    top: 0;
    background-color: white;
    z-index: 5;
  }

  .recherche,
  .actions {
    display: flex;
    align-items: center;
    flex-direction: row;
    gap: 12px;
  }
</style>
