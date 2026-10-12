<script lang="ts">
  import ActionsTiroir from '../ui/tiroirs/ActionsTiroir.svelte';
  import ContenuTiroir from '../ui/tiroirs/ContenuTiroir.svelte';
  import type { GroupeEntites } from '../groupes/groupes.d';
  import { singulierPluriel } from '../outils/string';
  import { untrack } from 'svelte';
  import { tiroirStore } from '../ui/stores/tiroir.store';
  import { toasterStore } from '../ui/stores/toaster.store';
  import { SvelteSet } from 'svelte/reactivity';
  import { apiGroupesEntites } from '../groupes/groupesEntites.api';
  import { estUnLibelleDejaUtilise } from '../groupes/groupes.api';

  interface Props {
    sirets: string[];
    groupes: GroupeEntites[];
    onGroupesModifies: () => Promise<void>;
    onEntitesClassees: () => void;
  }

  let { sirets, groupes, onGroupesModifies, onEntitesClassees }: Props =
    $props();
  export const titre = untrack(
    () =>
      `Classer ${sirets.length} ${singulierPluriel('entité', 'entités', sirets.length)}`
  );
  export const sousTitre =
    'Choisissez un ou plusieurs groupes dans lesquels ajouter vos entités.';

  let idsGroupes = new SvelteSet<string>();

  const associeEntitesAuxGroupes = async () => {
    await axios.post('/api/admin/groupes-entites/associations', {
      idsGroupes: [...idsGroupes],
      sirets,
    });

    const nbEntites = sirets.length;
    const nomGroupes = groupes
      .filter((g) => idsGroupes.has(g.id))
      .map((g) => `« ${g.libelle} »`);
    const formatteListe = new Intl.ListFormat('fr', { type: 'conjunction' });
    toasterStore.succes(
      singulierPluriel('Entité classée', 'Entités classées', nbEntites),
      `${nbEntites} ${singulierPluriel('entité a été classée', 'entités ont été classées', nbEntites)} dans ${formatteListe.format(nomGroupes)}.`
    );
    await onGroupesModifies();
    onEntitesClassees();
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
      const { data } = await apiGroupesEntites.ajouteGroupe(nouveauLibelle);
      groupes = [...groupes, data];
      idsGroupes.add(data.id);
      nouveauLibelle = '';
      await onGroupesModifies();
    } catch (e) {
      if (estUnLibelleDejaUtilise(e)) {
        erreurLibelle = 'Vous avez déjà un groupe avec ce libellé.';
        return;
      }
    } finally {
      enCoursAjout = false;
    }
  };

  const descriptionGroupe = (groupe: GroupeEntites) => {
    const nombre = groupe.siretsAssocies.length;
    if (nombre === 0) return 'Aucune entité';
    return `${nombre} ${singulierPluriel('entité', 'entités', nombre)}`;
  };
</script>

<ContenuTiroir>
  <h4>Groupes</h4>
  {#if groupes.length > 0}
    <div class="conteneur-selection">
      {#each groupes as groupe (groupe.id)}
        <dsfr-checkbox
          id="checkbox-{groupe.id}"
          hint={descriptionGroupe(groupe)}
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
        'votre entité',
        'vos entités',
        sirets.length
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
      id="nouveau-groupe-entites"
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
    label="Classer {singulierPluriel('l’entité', 'les entités', sirets.length)}"
    disabled={!idsGroupes.size}
    kind="primary"
    onclick={async () => await associeEntitesAuxGroupes()}
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

  p {
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
