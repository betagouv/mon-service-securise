<script lang="ts">
  import type {
    ContactsUtiles,
    PartiesPrenantes,
    TypePartiePrenante,
  } from './contactsUtiles.types';
  import InputDSFR from '../../../ui/InputDSFR.svelte';
  import { metsAJourContactsUtiles } from './contactsUtiles.api';
  import { untrack } from 'svelte';
  import { toasterStore } from '../../../ui/stores/toaster.store';
  import CarteFormulaire from '../../../ui/CarteFormulaire.svelte';

  interface Props {
    idService: string;
    contactsUtiles: ContactsUtiles;
  }

  let { idService, contactsUtiles: contactsUtilesInitiaux }: Props = $props();
  let contactsUtiles = $state<ContactsUtiles>(
    (() => {
      const snapshot = $state.snapshot(untrack(() => contactsUtilesInitiaux));
      return {
        ...snapshot,
        partiesPrenantes: {
          Hebergement: { nom: '', pointContact: '', natureAcces: '' },
          SecuriteService: { nom: '', pointContact: '', natureAcces: '' },
          DeveloppementFourniture: {
            nom: '',
            pointContact: '',
            natureAcces: '',
          },
          MaintenanceService: { nom: '', pointContact: '', natureAcces: '' },
          ...(snapshot.partiesPrenantes as Partial<PartiesPrenantes>),
        },
      };
    })()
  );

  const configurationsTabs = [
    { id: 'gouvernance', label: 'Gouvernance' },
    { id: 'parties-prenantes', label: 'Parties prenantes' },
  ];

  const toutesPartiesPrenantes = [
    'Hebergement',
    'DeveloppementFourniture',
    'MaintenanceService',
    'SecuriteService',
  ] as Array<TypePartiePrenante>;
  const labelsPartiesPrenantes: Record<TypePartiePrenante, string> = {
    Hebergement: 'Hébergement du service',
    DeveloppementFourniture: 'Développement / fourniture du service',
    MaintenanceService: 'Maintenance du service',
    SecuriteService: 'Gestion de la sécurité du service',
  };

  const ajouteActeur = () => {
    contactsUtiles.acteursHomologation.push({
      nom: '',
      fonction: '',
      role: '',
    });
  };

  const supprimeActeur = (index: number) => {
    contactsUtiles.acteursHomologation.splice(index, 1);
  };

  const ajoutePartiePrenante = () => {
    contactsUtiles.partiesPrenantesSpecifiques.push({
      nom: '',
      natureAcces: '',
      pointContact: '',
    });
  };

  const supprimePartiePrenante = (index: number) => {
    contactsUtiles.partiesPrenantesSpecifiques.splice(index, 1);
  };

  const sauvegardeContacts = async () => {
    await metsAJourContactsUtiles(idService, contactsUtiles);
    document.dispatchEvent(new CustomEvent('contacts-utiles-service-modifiee'));
    toasterStore.succes(
      'Mise à jour réussie',
      'Les contacts utiles de votre service ont été mis à jour avec succès.'
    );
  };
</script>

<dsfr-tabs tabs={configurationsTabs}>
  <div slot="panel-1" class="conteneur-onglet">
    <CarteFormulaire titre="Autorité d'homologation">
      <InputDSFR
        label="Prénom / Nom"
        bind:value={contactsUtiles.autoriteHomologation.nom}
      ></InputDSFR>
      <InputDSFR
        label="Fonction"
        bind:value={contactsUtiles.autoriteHomologation.fonction}
      ></InputDSFR>
    </CarteFormulaire>

    <CarteFormulaire titre="Spécialiste cybersécurité">
      <InputDSFR
        label="Prénom / Nom"
        bind:value={contactsUtiles.expertCybersecurite.nom}
      ></InputDSFR>
      <InputDSFR
        label="Fonction"
        bind:value={contactsUtiles.expertCybersecurite.fonction}
      ></InputDSFR>
    </CarteFormulaire>

    <CarteFormulaire
      titre="Délégué·e à la protection des données à caractère personnel"
    >
      <InputDSFR
        label="Prénom / Nom"
        bind:value={contactsUtiles.delegueProtectionDonnees.nom}
      ></InputDSFR>
      <InputDSFR
        label="Fonction"
        bind:value={contactsUtiles.delegueProtectionDonnees.fonction}
      ></InputDSFR>
    </CarteFormulaire>

    <CarteFormulaire titre="Responsables métier du projet">
      <InputDSFR
        label="Prénom / Nom"
        bind:value={contactsUtiles.piloteProjet.nom}
      ></InputDSFR>
      <InputDSFR
        label="Fonction"
        bind:value={contactsUtiles.piloteProjet.fonction}
      ></InputDSFR>
    </CarteFormulaire>

    {#each contactsUtiles.acteursHomologation as _, index (index)}
      <CarteFormulaire onsupprimer={() => supprimeActeur(index)}>
        <InputDSFR
          label="Rôle au regard du projet"
          bind:value={contactsUtiles.acteursHomologation[index].role}
        ></InputDSFR>
        <InputDSFR
          label="Prénom / Nom"
          bind:value={contactsUtiles.acteursHomologation[index].nom}
        ></InputDSFR>
        <InputDSFR
          label="Fonction"
          bind:value={contactsUtiles.acteursHomologation[index].fonction}
        ></InputDSFR>
      </CarteFormulaire>
    {/each}

    <!-- svelte-ignore a11y_click_events_have_key_events, a11y_no_static_element_interactions -->
    <dsfr-button
      label="Ajouter un acteur"
      kind="tertiary-no-outline"
      has-icon
      icon="add-line"
      icon-place="left"
      size="md"
      onclick={ajouteActeur}
    ></dsfr-button>
  </div>

  <div slot="panel-2" class="conteneur-onglet">
    {#each toutesPartiesPrenantes as typePartiePrenante (typePartiePrenante)}
      <CarteFormulaire titre={labelsPartiesPrenantes[typePartiePrenante]}>
        <InputDSFR
          label="Nom de l'entité externe ou interne"
          bind:value={contactsUtiles.partiesPrenantes[typePartiePrenante].nom}
        ></InputDSFR>
        <InputDSFR
          label="Nature de l'accès au service numérique"
          bind:value={
            contactsUtiles.partiesPrenantes[typePartiePrenante].natureAcces
          }
        ></InputDSFR>
        <InputDSFR
          label="Point de contact"
          bind:value={
            contactsUtiles.partiesPrenantes[typePartiePrenante].pointContact
          }
        ></InputDSFR>
      </CarteFormulaire>
    {/each}

    {#each contactsUtiles.partiesPrenantesSpecifiques as _, index (index)}
      <CarteFormulaire onsupprimer={() => supprimePartiePrenante(index)}>
        <InputDSFR
          label="Nom de l'entité"
          bind:value={contactsUtiles.partiesPrenantesSpecifiques[index].nom}
        ></InputDSFR>
        <InputDSFR
          label="Nature de l'accès au service numérique"
          bind:value={
            contactsUtiles.partiesPrenantesSpecifiques[index].natureAcces
          }
        ></InputDSFR>
        <InputDSFR
          label="Point de contact"
          bind:value={
            contactsUtiles.partiesPrenantesSpecifiques[index].pointContact
          }
        ></InputDSFR>
      </CarteFormulaire>
    {/each}

    <!-- svelte-ignore a11y_click_events_have_key_events, a11y_no_static_element_interactions -->
    <dsfr-button
      label="Ajouter une partie prenante"
      kind="tertiary-no-outline"
      has-icon
      icon="add-line"
      icon-place="left"
      size="md"
      onclick={ajoutePartiePrenante}
    ></dsfr-button>
  </div>
</dsfr-tabs>

<div class="barre-actions">
  <!-- svelte-ignore a11y_click_events_have_key_events, a11y_no_static_element_interactions -->
  <dsfr-button
    label="Enregistrer les modifications"
    kind="primary"
    has-icon
    icon="save-line"
    icon-place="left"
    size="md"
    onclick={sauvegardeContacts}
  ></dsfr-button>
</div>

<style lang="scss">
  dsfr-tabs {
    margin-bottom: 32px;

    .conteneur-onglet {
      display: flex;
      flex-direction: column;
      gap: 24px;
    }
  }

  .barre-actions {
    position: sticky;
    bottom: 0;
    background: white;
    border-top: 1px solid #ddd;
    padding: 24px 72px;
    margin-left: -72px;
    margin-right: -24px;
    margin-bottom: -24px;
  }
</style>
