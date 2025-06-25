<script lang="ts">
  import { decode } from 'html-entities';
  import type { MesureReferentiel, ReferentielStatut } from '../../ui/types.d';
  import { mesuresAvecServicesAssociesStore } from '../stores/mesuresAvecServicesAssocies.store';
  import { servicesAvecMesuresAssociees } from '../stores/servicesAvecMesuresAssociees.store';
  import TagStatutMesure from '../../ui/TagStatutMesure.svelte';
  import DescriptionCompleteMesure from './DescriptionCompleteMesure.svelte';
  import Tableau from '../../ui/Tableau.svelte';
  import Modale from '../../ui/Modale.svelte';
  import { tick } from 'svelte';
  import Bouton from '../../ui/Bouton.svelte';

  export let referentielStatuts: ReferentielStatut;

  let elementModale: Modale;
  let mesure: MesureReferentiel;
  $: servicesAssocies =
    mesure &&
    $servicesAvecMesuresAssociees.filter((s) => {
      return $mesuresAvecServicesAssociesStore[mesure.id].includes(s?.id);
    });

  export const affiche = async (mesureAAfficher: MesureReferentiel) => {
    mesure = mesureAAfficher;
    await tick();
    elementModale.affiche();
  };
</script>

{#if mesure}
  <Modale bind:this={elementModale}>
    <svelte:fragment slot="entete">
      <h4>Mesure</h4>
      <DescriptionCompleteMesure {mesure} />
      <h4>
        {servicesAssocies.length}
        {servicesAssocies.length > 1 ? 'services associés' : 'service associé'} à
        cette mesure
      </h4>
    </svelte:fragment>
    <svelte:fragment slot="contenu">
      <Tableau
        colonnes={[
          { cle: 'nom', libelle: 'Nom du service' },
          { cle: 'statut', libelle: 'Statut actuel' },
          { cle: 'modalites', libelle: 'Précision actuelle' },
        ]}
        donnees={servicesAssocies}
      >
        <svelte:fragment slot="cellule" let:donnee let:colonne>
          {#if colonne.cle === 'nom'}
            <div class="intitule-service">
              <span class="nom">{decode(donnee.nomService)}</span>
              <span class="organisation">{donnee.organisationResponsable}</span>
            </div>
          {:else if colonne.cle === 'statut'}
            <TagStatutMesure
              {referentielStatuts}
              statut={donnee.mesuresAssociees[mesure.id].statut}
            />
          {:else if colonne.cle === 'modalites'}
            {decode(donnee.mesuresAssociees[mesure.id].modalites) || ''}
          {/if}
        </svelte:fragment>
      </Tableau>
    </svelte:fragment>
    <svelte:fragment slot="actions">
      <Bouton
        titre="Retour à la liste de mesures"
        type="secondaire"
        on:click={() => elementModale.ferme()}
      />
    </svelte:fragment>
  </Modale>
{/if}

<style lang="scss">
  .intitule-service {
    display: flex;
    flex-direction: column;
    gap: 4px;

    .nom {
      font-weight: bold;
    }
  }

  h4 {
    font-size: 1.5rem;
    font-weight: 700;
    line-height: 2rem;
    margin: 0 0 24px;
    text-align: left;
  }
</style>
