<script lang="ts">
  import MenuFlottant from '../../ui/MenuFlottant.svelte';
  import type { IdCategorie, IdStatut } from '../tableauDesMesures.d';
  import {
    IdReferentiel,
    nombreResultats,
    rechercheCategorie,
    rechercheReferentiel,
    rechercheStatut,
  } from '../tableauDesMesures.store';
  import { menuNavigationOuvert } from '../../ui/menuNavigation.store';
  import NombreResultatsFiltres from './NombreResultatsFiltres.svelte';

  export let categories: Record<IdCategorie, string>;
  export let statuts: Record<IdStatut, string>;

  const effaceFiltres = () => {
    rechercheCategorie.set([]);
    rechercheStatut.set([]);
    rechercheReferentiel.set([]);
  };

  $: cocheGlobaleANSSI =
    $rechercheReferentiel.includes(IdReferentiel.ANSSIRecommandee) &&
    $rechercheReferentiel.includes(IdReferentiel.ANSSIIndispensable);
  let selectionPartielleANSSI: boolean;
  $: {
    const estRecommandee = $rechercheReferentiel.includes(
      IdReferentiel.ANSSIRecommandee
    );
    const estIndispensable = $rechercheReferentiel.includes(
      IdReferentiel.ANSSIIndispensable
    );
    selectionPartielleANSSI = estRecommandee
      ? !estIndispensable
      : estIndispensable;
  }
  const gereCocheANSSI = () => {
    const devientCochee = !cocheGlobaleANSSI;
    if (devientCochee) rechercheReferentiel.ajouteLesReferentielsANSSI();
    else rechercheReferentiel.supprimeLesReferentielsANSSI();
  };
</script>

<MenuFlottant parDessusDeclencheur={true}>
  <div slot="declencheur">
    <button class="bouton bouton-secondaire bouton-filtre">
      <img src="/statique/assets/images/icone_filtre.svg" alt="" />
      Filtres
    </button>
  </div>

  <div class="filtres-disponibles">
    <div class="entete">
      <div class="titre-filtres">
        <img src="/statique/assets/images/icone_filtre.svg" alt="" />
        Filtres
      </div>
      <NombreResultatsFiltres />
    </div>
    <fieldset>
      <legend>Catégories de cybersécurité</legend>
      {#each Object.entries(categories) as [id, categorie]}
        <div>
          <input
            type="checkbox"
            {id}
            name={id}
            bind:group={$rechercheCategorie}
            value={id}
          />
          <label for={id}>{categorie}</label>
        </div>
      {/each}
    </fieldset>
    <fieldset>
      <legend>Statut</legend>
      {#each Object.entries( { ...statuts, nonRenseignee: 'Non renseignée' } ) as [id, statut]}
        <div>
          <input
            type="checkbox"
            {id}
            name={id}
            bind:group={$rechercheStatut}
            value={id}
          />
          <label for={id}>{statut}</label>
        </div>
      {/each}
    </fieldset>
    <fieldset>
      <legend>Mesures par référentiel</legend>
      <div>
        <input
          type="checkbox"
          id="anssi"
          name="anssi"
          bind:checked={cocheGlobaleANSSI}
          on:click={gereCocheANSSI}
          class:selection-partielle={selectionPartielleANSSI}
        />
        <label for="anssi">ANSSI</label>
      </div>
      <div>
        <input
          type="checkbox"
          id="anssi-indispensable"
          name="anssi-indispensable"
          bind:group={$rechercheReferentiel}
          value={IdReferentiel.ANSSIIndispensable}
          class="decalage-checkbox"
        />
        <label for="anssi-indispensable">Indispensable</label>
      </div>
      <div>
        <input
          type="checkbox"
          id="anssi-recommandee"
          name="anssi-recommandee"
          bind:group={$rechercheReferentiel}
          value={IdReferentiel.ANSSIRecommandee}
          class="decalage-checkbox"
        />
        <label for="anssi-recommandee">Recommandée</label>
      </div>
      <div>
        <input
          type="checkbox"
          id="mesure-cnil"
          name="mesure-cnil"
          bind:group={$rechercheReferentiel}
          value={IdReferentiel.CNIL}
        />
        <label for="mesure-cnil">CNIL</label>
      </div>
      <div>
        <input
          type="checkbox"
          id="mesure-ajoutee"
          name="mesure-ajoutee"
          bind:group={$rechercheReferentiel}
          value={IdReferentiel.MesureAjoutee}
        />
        <label for="mesure-ajoutee">Mesures ajoutées</label>
      </div>
    </fieldset>
    <button
      class="bouton bouton-secondaire bouton-effacer-filtre"
      on:click={effaceFiltres}
    >
      Effacer les filtres
    </button>
  </div>
</MenuFlottant>

<style>
  .bouton-filtre {
    display: flex;
    gap: 8px;
  }

  .entete {
    display: flex;
    flex-direction: row;
    align-items: center;
    gap: 31.5px;
  }

  .entete :global(.nombre-resultat) {
    margin-top: -8px;
  }

  .titre-filtres {
    display: flex;
    gap: 8px;
    padding: calc(0.5em + 1px) calc(1em - 16px + 1px);
    font-weight: 500;
    color: var(--bleu-mise-en-avant);
    margin-bottom: 8px;
  }

  .filtres-disponibles {
    width: 280px;
    border-radius: 8px;
    border: 1px solid #cbd5e1;
    background: white;
    padding: 0 16px 24px 16px;
    max-height: min(100vh - 320px, 100vh);
    overflow-y: scroll;
  }

  .filtres-disponibles fieldset {
    display: flex;
    flex-direction: column;
    align-items: flex-start;
    padding: 0;
    margin: 0 0 24px;
  }

  .filtres-disponibles legend {
    text-align: left;
  }

  .bouton-effacer-filtre {
    margin-top: 8px;
  }

  .bouton {
    margin: 0;
    padding: 0.5em 1em;
    font-weight: 500;
  }

  #anssi.selection-partielle {
    background-color: var(--bleu-mise-en-avant);
  }

  #anssi.selection-partielle::before {
    content: '';
    display: block;
    margin: auto;
    width: 0.6em;
    height: 0.7em;
    border-bottom: 0.15em #fff solid;
  }

  .decalage-checkbox {
    margin-left: 12px;
  }
</style>
