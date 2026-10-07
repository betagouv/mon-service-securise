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
  import { selectionIdsServices } from '../../tableauDeBord/stores/selectionService.store';
  import { api, estUnLibelleDejaUtilise } from '../../groupes/groupes.api';

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
    selectionIdsServices.vide();
    tiroirStore.ferme();
  };

  const selectionneGroupe = (idGroupe: string, selectionne: boolean) => {
    if (selectionne) idsGroupes.add(idGroupe);
    else idsGroupes.delete(idGroupe);
  };

  let modeCreation = $state(false);
  let nouveauLibelle = $state('');
  let erreurLibelle = $state('');
  let enCoursAjout = $state(false);

  const ajouteGroupe = async () => {
    if (!nouveauLibelle.trim()) return;

    enCoursAjout = true;
    erreurLibelle = '';
    try {
      const { data } = await api.ajouteGroupe(nouveauLibelle);
      document.body.dispatchEvent(new CustomEvent('rafraichis-groupes'));
      groupes = [...groupes, data];
      nouveauLibelle = '';
    } catch (e) {
      if (estUnLibelleDejaUtilise(e)) {
        erreurLibelle = 'Vous avez déjà un groupe avec ce libellé.';
        return;
      }
    } finally {
      enCoursAjout = false;
    }
  };
</script>

<ContenuTiroir>
  {#if groupes.length > 0}
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
  {:else}
    <p>
      Vous n’avez pas encore de groupe. Créez-en un pour classer {singulierPluriel(
        'votre service',
        'vos services',
        services.length
      )}
    </p>
  {/if}
  {#if !modeCreation}
    <!-- svelte-ignore a11y_click_events_have_key_events,a11y_no_static_element_interactions -->
    <dsfr-button
      kind="secondary"
      has-icon
      icon="add-line"
      label="Créer un groupe"
      onclick={() => (modeCreation = true)}
    ></dsfr-button>
  {:else}
    <dsfr-input
      id="nouveau-groupe"
      label="Nom du nouveau groupe"
      value={nouveauLibelle}
      onvaluechanged={(e: CustomEvent<string>) => (nouveauLibelle = e.detail)}
      maxlength="200"
      status={erreurLibelle ? 'error' : 'default'}
      errorMessage={erreurLibelle}
    ></dsfr-input>
    <div class="conteneur-actions-ajout">
      <!-- svelte-ignore a11y_click_events_have_key_events,a11y_no_static_element_interactions -->
      <dsfr-button
        kind="tertiary-no-outline"
        label="Annuler"
        onclick={() => {
          modeCreation = false;
          nouveauLibelle = '';
          erreurLibelle = '';
        }}
      ></dsfr-button>
      <!-- svelte-ignore a11y_click_events_have_key_events,a11y_no_static_element_interactions -->
      <dsfr-button
        kind="primary"
        label="Créer le groupe"
        onclick={async () => await ajouteGroupe()}
        disabled={enCoursAjout || !nouveauLibelle.trim()}
      ></dsfr-button>
    </div>
  {/if}
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
    disabled={!idsGroupes.size}
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

  .conteneur-actions-ajout {
    display: flex;
    gap: 8px;
    justify-content: end;
  }
</style>
