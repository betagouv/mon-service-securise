<script lang="ts">
  import { rechercheTextuelle } from '../stores/rechercheTextuelle.store';
  import { nombreResultats } from '../stores/nombreDeResultats.store';
  import type { ReferentielStatut } from '../../ui/types';
  import TagStatutMesure from '../../ui/TagStatutMesure.svelte';
  import { rechercheParAvancement } from '../stores/rechercheParAvancement.store';

  interface Props {
    referentielStatuts: ReferentielStatut;
    onSupprimeFiltres?: () => void;
  }

  let { referentielStatuts, onSupprimeFiltres }: Props = $props();

  const supprimeRechercheEtFiltres = () => {
    onSupprimeFiltres?.();
    $rechercheTextuelle = '';
  };
</script>

<tr class="ligne-aucun-resultat">
  <td>
    <div class="aucun-resultat">
      {#if $nombreResultats.aDesFiltresAppliques || $rechercheTextuelle}
        <img
          src="/statique/assets/images/illustration_recherche_vide.svg"
          alt=""
        />
        Aucune mesure ne correspond à la recherche.
        <button
          class="bouton bouton-secondaire"
          onclick={supprimeRechercheEtFiltres}
        >
          Effacer la recherche
        </button>
      {:else}
        <img src="/statique/assets/images/dossiers.png" alt="" />
        <div class="avancements">
          Aucune mesure ne possède le statut
          {#if $rechercheParAvancement === 'enAction'}
            <TagStatutMesure statut="aLancer" {referentielStatuts} />
            ou
            <TagStatutMesure statut="enCours" {referentielStatuts} />
          {:else if $rechercheParAvancement === 'traite'}
            <TagStatutMesure statut="fait" {referentielStatuts} />
            ou
            <TagStatutMesure statut="nonFait" {referentielStatuts} />
          {/if}
        </div>
      {/if}
    </div>
  </td>
</tr>

<style>
  .ligne-aucun-resultat {
    border: 1px solid var(--liseres-fonce);
  }

  .aucun-resultat {
    padding: 64px 0;
    display: flex;
    gap: 16px;
    align-items: center;
    flex-direction: column;
    color: var(--texte-clair);
  }

  .aucun-resultat img {
    max-width: 128px;
  }

  .aucun-resultat button {
    margin: 0;
    padding: 8px 16px;
  }

  .avancements {
    display: flex;
    gap: 8px;
    align-items: center;
  }
</style>
