<script lang="ts">
  import { onMount } from 'svelte';
  import Toaster from '../ui/Toaster.svelte';
  import { toasterStore } from '../ui/stores/toaster.store';
  import { api, estUnLibelleDejaUtilise } from './groupes.api';
  import type { Groupe } from './groupes.d';
  import ModaleRenommageGroupe from './ModaleRenommageGroupe.svelte';
  import ModaleSuppressionGroupe from './ModaleSuppressionGroupe.svelte';
  import { singulierPluriel } from '../outils/string';
  import { services } from '../tableauDeBord/stores/services.store';
  import type { ReponseApiServices } from '../tableauDeBord/tableauDeBord.d';
  import Loader from '../ui/Loader.svelte';

  let groupes = $state<Groupe[]>([]);
  let enCoursChargement = $state(true);
  let nouveauLibelle = $state('');
  let erreurLibelle = $state('');
  let enCoursAjout = $state(false);
  let groupeARenommer = $state<Groupe | null>(null);
  let groupeASupprimer = $state<Groupe | null>(null);

  onMount(async () => {
    const [reponseServices, groupesLus] = await Promise.all([
      axios.get<ReponseApiServices>('/api/services'),
      api.lisGroupes(),
    ]);
    services.reinitialise(reponseServices.data.services);
    groupes = groupesLus;
    enCoursChargement = false;
  });

  const ajouteGroupe = async () => {
    if (!nouveauLibelle.trim()) return;

    enCoursAjout = true;
    erreurLibelle = '';
    try {
      const { data } = await api.ajouteGroupe(nouveauLibelle);
      toasterStore.succes('Succès', 'Le groupe a été créé.');
      groupes = [...groupes, data];
      nouveauLibelle = '';
    } catch (e) {
      if (estUnLibelleDejaUtilise(e)) {
        erreurLibelle = 'Vous avez déjà un groupe avec ce libellé.';
        return;
      }
      toasterStore.erreur(
        'Erreur',
        "Le groupe n'a pas pu être ajouté, veuillez réessayer."
      );
    } finally {
      enCoursAjout = false;
    }
  };

  const remplaceGroupe = (renommee: Groupe) => {
    groupes = groupes.map((c) => (c.id === renommee.id ? renommee : c));
  };

  const retireGroupe = (idSupprimee: string) => {
    groupes = groupes.filter((c) => c.id !== idSupprimee);
  };
</script>

<h1>Mes groupes</h1>

<p>
  Organisez vos services en groupes pour faciliter leur classement et leur
  gestion.
</p>

<dsfr-input
  id="nouveau-groupe"
  label="Nouveau groupe"
  hint="exemple : Enfance et famille"
  value={nouveauLibelle}
  onvaluechanged={(e: CustomEvent<string>) => (nouveauLibelle = e.detail)}
  maxlength="200"
  status={erreurLibelle ? 'error' : 'default'}
  errorMessage={erreurLibelle}
  action
>
  <!-- svelte-ignore a11y_click_events_have_key_events, a11y_no_static_element_interactions -->
  <dsfr-button
    slot="button"
    label="Créer le groupe"
    size="md"
    has-icon
    icon="add-line"
    icon-place="left"
    type="button"
    disabled={enCoursAjout || !nouveauLibelle.trim()}
    onclick={ajouteGroupe}
  ></dsfr-button>
</dsfr-input>

{#if enCoursChargement}
  <div class="conteneur-loader">
    <Loader />
  </div>
{:else if groupes.length === 0}
  <div class="aucun-groupe">
    <img src="/statique/assets/images/illustration_dossiers.svg" alt="" />
    <h2>Vous n’avez pas encore créé de groupe</h2>
    <p>
      Saisissez un nom ci-dessus puis cliquez sur « Créer le groupe ». Vous
      pourrez ensuite y classer vos services depuis le tableau de bord.
    </p>
  </div>
{:else}
  <div class="conteneur-liste">
    <p>
      Un service peut appartenir à plusieurs groupes : la somme des colonnes
      «&nbsp;Services&nbsp;» peut donc dépasser le nombre total de services
      enregistrés. Pour classer un service dans un groupe, rendez-vous sur le
      tableau de bord.
    </p>
    <dsfr-table
      columns={[
        { key: 'libelle', label: 'Nom du groupe' },
        { key: 'services', label: 'Services' },
        { key: 'actions', label: 'Actions' },
      ]}
      rows={groupes}
      rich
      multiline
    >
      {#each groupes as groupe, i (groupe.id)}
        {@const nombreServices = groupe.idServicesAssocies.filter((id) =>
          $services.some((s) => s.id === id)
        ).length}
        <div slot="cell:libelle:{i}">
          <span class="contenu-libelle"
            ><lab-anssi-icone nom="folder-2-line" taille="sm"
            ></lab-anssi-icone>{groupe.libelle}</span
          >
        </div>
        <div slot="cell:services:{i}">
          <dsfr-link
            label="{nombreServices} {singulierPluriel(
              'service',
              'services',
              nombreServices
            )}"
            title="Voir les services du groupe {groupe.libelle} sur le tableau de bord"
            href="/tableauDeBord?idGroupe={groupe.id}"
            size="sm"
          ></dsfr-link>
        </div>
        <div slot="cell:actions:{i}" class="conteneur-actions">
          <!-- svelte-ignore a11y_click_events_have_key_events, a11y_no_static_element_interactions -->
          <dsfr-button
            label="Renommer"
            kind="secondary"
            size="sm"
            has-icon
            icon="edit-line"
            icon-place="left"
            type="button"
            onclick={() => (groupeARenommer = groupe)}
          ></dsfr-button>
          <!-- svelte-ignore a11y_click_events_have_key_events, a11y_no_static_element_interactions -->
          <dsfr-button
            label="Supprimer"
            kind="tertiary"
            size="sm"
            has-icon
            icon="delete-line"
            icon-place="left"
            type="button"
            onclick={() => (groupeASupprimer = groupe)}
          ></dsfr-button>
        </div>
      {/each}
    </dsfr-table>
  </div>
{/if}

<ModaleRenommageGroupe
  groupe={groupeARenommer}
  onRenommee={remplaceGroupe}
  onFerme={() => (groupeARenommer = null)}
/>

<ModaleSuppressionGroupe
  groupe={groupeASupprimer}
  onSupprimee={retireGroupe}
  onFerme={() => (groupeASupprimer = null)}
/>

<Toaster />

<style lang="scss">
  :global(main:has(#conteneur-groupes)) {
    background: white;
    text-align: left;
  }

  :global(#conteneur-groupes) {
    width: 792px;
  }

  h1 {
    color: #161616;
    font-size: 2rem;
    line-height: 2.5rem;
    margin: 56px 0 0;
  }

  h1 + p {
    color: #3a3a3a;
    font-size: 1.25rem;
    line-height: 2rem;
    margin: 16px 0;
    text-align: left;
  }

  dsfr-button {
    white-space: nowrap;
  }

  .conteneur-liste {
    margin: 8px 0 24px;

    p {
      margin: 24px 0 8px;
      color: #3a3a3a;
      font-size: 0.875rem;
      line-height: 1.5rem;
    }

    .contenu-libelle {
      display: flex;
      gap: 4px;
    }
  }

  .conteneur-loader {
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 24px;
  }

  .conteneur-actions {
    display: flex;
    align-items: center;
    gap: 8px;
  }

  .aucun-groupe {
    padding: 48px 0 56px;
    display: flex;
    align-items: center;
    flex-direction: column;
    color: #161616;
    border: 1px solid #ddd;
    margin-top: 24px;

    img {
      width: 200px;
    }

    h2 {
      color: #161616;
      text-align: center;
      font-size: 1.5rem;
      font-weight: 700;
      line-height: 2rem;
      margin: 16px 0 0;
    }

    p {
      margin: 0;
      font-size: 1.125rem;
      line-height: 1.75rem;
      font-weight: 400;
      text-align: center;
      color: #3a3a3a;
      width: 588px;
    }
  }
</style>
