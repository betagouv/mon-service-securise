<script lang="ts">
  import MenuFlottant from '../../ui/MenuFlottant.svelte';
  import type { IdCategorie } from '../tableauDesMesures.d';
  import { nombreResultats } from '../stores/nombreDeResultats.store';
  import NombreResultatsFiltres from './NombreResultatsFiltres.svelte';
  import IconeFiltre from './IconeFiltre.svelte';
  import {
    IdReferentiel,
    rechercheParReferentiel,
  } from '../stores/rechercheParReferentiel.store';
  import { rechercheParCategorie } from '../stores/rechercheParCategorie.store';
  import type { ReferentielPriorite } from '../../ui/types.d';
  import { rechercheParPriorite } from '../stores/rechercheParPriorite.store';
  import { featureFlags } from '../../featureFlags';
  import { rechercheMesMesures } from '../stores/rechercheMesMesures.store';

  export let categories: Record<IdCategorie, string>;
  export let priorites: ReferentielPriorite;

  const effaceFiltres = () => {
    rechercheParCategorie.set([]);
    rechercheParReferentiel.set([]);
    rechercheParPriorite.set([]);
    rechercheMesMesures.set(false);
  };

  $: cocheGlobaleANSSI =
    $rechercheParReferentiel.includes(IdReferentiel.ANSSIRecommandee) &&
    $rechercheParReferentiel.includes(IdReferentiel.ANSSIIndispensable);
  let selectionPartielleANSSI: boolean;
  $: {
    const estRecommandee = $rechercheParReferentiel.includes(
      IdReferentiel.ANSSIRecommandee
    );
    const estIndispensable = $rechercheParReferentiel.includes(
      IdReferentiel.ANSSIIndispensable
    );
    selectionPartielleANSSI = estRecommandee
      ? !estIndispensable
      : estIndispensable;
  }
  const gereCocheANSSI = () => {
    const devientCochee = !cocheGlobaleANSSI;
    if (devientCochee) rechercheParReferentiel.ajouteLesReferentielsANSSI();
    else rechercheParReferentiel.supprimeLesReferentielsANSSI();
  };
</script>

<MenuFlottant parDessusDeclencheur={true}>
  <div slot="declencheur">
    <button class="bouton bouton-secondaire bouton-filtre">
      <IconeFiltre filtresActifs={$nombreResultats.aDesFiltresAppliques} />
    </button>
  </div>

  <div class="filtres-disponibles">
    <div class="entete">
      <div class="titre-filtres">
        <IconeFiltre filtresActifs={$nombreResultats.aDesFiltresAppliques} />
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
            bind:group={$rechercheParCategorie}
            value={id}
          />
          <label for={id}>{categorie}</label>
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
          bind:group={$rechercheParReferentiel}
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
          bind:group={$rechercheParReferentiel}
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
          bind:group={$rechercheParReferentiel}
          value={IdReferentiel.CNIL}
        />
        <label for="mesure-cnil">CNIL</label>
      </div>
      <div>
        <input
          type="checkbox"
          id="mesure-ajoutee"
          name="mesure-ajoutee"
          bind:group={$rechercheParReferentiel}
          value={IdReferentiel.MesureAjoutee}
        />
        <label for="mesure-ajoutee">Mesures ajoutées</label>
      </div>
    </fieldset>
    {#if featureFlags.planAction()}
      <fieldset>
        <legend>Priorité</legend>
        {#each Object.entries(priorites) as [id, labels]}
          <div>
            <input
              type="checkbox"
              {id}
              name={id}
              bind:group={$rechercheParPriorite}
              value={id}
            />
            <label for={id}>{labels.libelleComplet}</label>
          </div>
        {/each}
      </fieldset>
      <fieldset>
        <legend>Attribution des mesures</legend>
        <div>
          <input
            type="checkbox"
            id="mes-mesures"
            bind:checked={$rechercheMesMesures}
          />
          <label for="mes-mesures">Mesure(s) dont je suis responsable</label>
        </div>
      </fieldset>
    {/if}
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
    margin-top: -12px;
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
    padding: 6px 14px;
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
