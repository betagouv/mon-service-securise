<script lang="ts">
  import { tiroirStore } from '../../ui/stores/tiroir.store';
  import TiroirAjoutModeleMesureSpecifique from './ajout/TiroirAjoutModeleMesureSpecifique.svelte';
  import type {
    ReferentielStatut,
    ReferentielTypesService,
  } from '../../ui/types';
  import type {
    ListeMesuresProps,
    CapaciteAjoutDeMesure,
  } from '../listeMesures.d';
  import TiroirTeleversementModeleMesureSpecifique from '../televersement/TiroirTeleversementModeleMesureSpecifique.svelte';

  interface Props {
    statuts: ReferentielStatut;
    categories: ListeMesuresProps['categories'];
    typesService: ReferentielTypesService;
    capaciteAjoutDeMesure: CapaciteAjoutDeMesure;
  }

  let { statuts, categories, typesService, capaciteAjoutDeMesure }: Props =
    $props();

  const afficheTiroirAjout = () => {
    tiroirStore.afficheContenu(TiroirAjoutModeleMesureSpecifique, {
      categories,
      statuts,
      referentielTypesService: typesService,
    });
  };

  const afficheTiroirTeleversement = () => {
    tiroirStore.afficheContenu(TiroirTeleversementModeleMesureSpecifique, {
      capaciteAjoutDeMesure,
    });
  };
</script>

<div class="contenu-tableau-vide">
  <div class="entete">
    <h4>Ajoutez vos propres mesures</h4>
    <p>
      Téléversez un fichier XLSX contenant vos mesures existantes, ou
      ajoutez-les manuellement
    </p>
  </div>
  <!-- svelte-ignore a11y_click_events_have_key_events, a11y_no_static_element_interactions -->
  <lab-anssi-bouton
    variante="primaire"
    taille="lg"
    titre="Importer des mesures depuis un fichier XLSX"
    onclick={afficheTiroirTeleversement}
  ></lab-anssi-bouton>
  <!-- svelte-ignore a11y_click_events_have_key_events, a11y_no_static_element_interactions -->
  <lab-anssi-bouton
    variante="secondaire"
    taille="lg"
    titre="Saisir manuellement une mesure"
    onclick={afficheTiroirAjout}
  ></lab-anssi-bouton>
</div>

<style lang="scss">
  .contenu-tableau-vide {
    border: 1px solid #ddd;
    padding: 72px 0;
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 16px;
    text-align: center;

    h4 {
      font-weight: bold;
      font-size: 1.5rem;
      line-height: 2rem;
      margin: 0 0 8px;
    }

    p {
      font-size: 0.875rem;
      line-height: 1.5rem;
      margin: 0;
      color: #666;
      max-width: 360px;
    }
  }
</style>
