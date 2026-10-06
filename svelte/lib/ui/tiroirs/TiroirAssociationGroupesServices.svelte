<script lang="ts">
  import ActionsTiroir from './ActionsTiroir.svelte';
  import ContenuTiroir from './ContenuTiroir.svelte';
  import type {
    GroupeServices,
    Service,
  } from '../../tableauDeBord/tableauDeBord.d';
  import { singulierPluriel } from '../../outils/string';
  import { untrack } from 'svelte';
  import { tiroirStore } from '../stores/tiroir.store';
  import { toasterStore } from '../stores/toaster.store';
  import { SvelteSet } from 'svelte/reactivity';

  interface Props {
    services: Service[];
    groupes: GroupeServices[];
  }

  let { services, groupes }: Props = $props();
  export const titre = untrack(
    () =>
      `Classer ${services.length} ${singulierPluriel('service', 'services', services.length)}`
  );
  export const sousTitre =
    'Choisissez un ou plusieurs groupes dans lesquels ajouter vos services.';

  let idsGroupes = new SvelteSet();
  const associeServicesAuxGroupes = async () => {
    await axios.post('/api/groupes-services/associations', {
      idsGroupes: [...idsGroupes],
      idsServices: services.map((service) => service.id),
    });
    document.body.dispatchEvent(new CustomEvent('rafraichis-groupes'));

    const nbServices = services.length;
    const nomGroupes = groupes
      .filter((g) => idsGroupes.has(g.id))
      .map((g) => `« ${g.libelle} »`);
    const formatteListe = new Intl.ListFormat('fr', { type: 'conjunction' });
    toasterStore.succes(
      singulierPluriel('Service classé', 'Services classés', nbServices),
      `${nbServices} ${singulierPluriel('service a été classé', 'services ont été classés', nbServices)} dans ${formatteListe.format(nomGroupes)}.`
    );
    tiroirStore.ferme();
  };

  const selectionneGroupe = (idGroupe: string, selectionne: boolean) => {
    if (selectionne) idsGroupes.add(idGroupe);
    else idsGroupes.delete(idGroupe);
  };
</script>

<ContenuTiroir>
  <h4>Groupes</h4>
  <div class="conteneur-selection">
    {#each groupes as groupe (groupe.id)}
      <dsfr-checkbox
        id="checkbox-{groupe.id}"
        hint={singulierPluriel(
          `${groupe.idServicesAssocies.length > 0 ? '1 service' : 'Aucun service'}`,
          `${groupe.idServicesAssocies.length} services`,
          groupe.idServicesAssocies.length
        )}
        size="md"
        label={groupe.libelle}
        name="checkbox-{groupe.id}"
        checked={idsGroupes.has(groupe.id)}
        onvaluechanged={(e: CustomEvent<boolean>) => {
          selectionneGroupe(groupe.id, e.detail);
        }}
      ></dsfr-checkbox>
    {/each}
  </div>
</ContenuTiroir>

<ActionsTiroir>
  <!-- svelte-ignore a11y_no_static_element_interactions, a11y_click_events_have_key_events -->
  <dsfr-button
    label="Annuler"
    kind="tertiary-no-outline"
    onclick={() => tiroirStore.ferme()}
  ></dsfr-button>
  <!-- svelte-ignore a11y_no_static_element_interactions, a11y_click_events_have_key_events -->
  <dsfr-button
    label="Classer {singulierPluriel(
      'le service',
      'les services',
      services.length
    )}"
    kind="primary"
    onclick={async () => await associeServicesAuxGroupes()}
  ></dsfr-button>
</ActionsTiroir>

<style lang="scss">
  h4 {
    color: #161616;
    font-size: 1.5rem;
    font-weight: 700;
    line-height: 2rem;
    margin: 0;
  }

  .conteneur-selection {
    display: flex;
    flex-direction: column;
    gap: 16px;
  }
</style>
