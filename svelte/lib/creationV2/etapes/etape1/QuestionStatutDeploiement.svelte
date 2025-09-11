<script lang="ts">
  import { createEventDispatcher } from 'svelte';

  export let estComplete: boolean;
  export let valeur: string;

  const dispatch = createEventDispatcher<{ champModifie: string }>();
  const metsAJourValeur = () => {
    if (valeur) {
      dispatch('champModifie', valeur);
    }
  };

  $: estComplete = !!valeur;
</script>

<label for="statut-deploiement">
  Quel est le statut de votre service ?
  <div>
    <input
      type="radio"
      id="enProjet"
      name="statut-deploiement"
      value="enProjet"
      bind:group={valeur}
      on:change={metsAJourValeur}
    />
    <label for="enProjet">En conception</label>
  </div>

  <div>
    <input
      type="radio"
      id="enCours"
      name="statut-deploiement"
      value="enCours"
      bind:group={valeur}
      on:change={metsAJourValeur}
    />
    <label for="enCours">En cours de développement ou de déploiement</label>
  </div>

  <div>
    <input
      type="radio"
      id="enLigne"
      name="statut-deploiement"
      value="enLigne"
      bind:group={valeur}
      on:change={metsAJourValeur}
    />
    <label for="enLigne">En ligne et accessible aux usagers et/ou agents</label>
  </div>
</label>

<style lang="scss">
  label {
    div {
      display: flex;
      gap: 8px;
      border: 1px solid #dddddd;
      padding: 12px 24px;
      border-radius: 8px;
      cursor: pointer;

      label {
        font-size: 1rem !important;
        line-height: 1.5rem !important;
        font-weight: normal !important;
      }
    }
  }
</style>
