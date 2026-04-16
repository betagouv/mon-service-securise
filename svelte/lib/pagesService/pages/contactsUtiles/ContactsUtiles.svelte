<script lang="ts">
  import type {
    ContactsUtiles,
    TypePartiePrenante,
  } from './contactsUtiles.types';
  import InputDSFR from './InputDSFR.svelte';

  const configurationsTabs = [
    {
      id: 'gouvernance',
      label: 'Gouvernance',
    },
    {
      id: 'parties-prenantes',
      label: 'Parties prenantes',
    },
  ];
  let contactsUtiles: ContactsUtiles | undefined = $state({
    autoriteHomologation: { nom: '', fonction: '' },
    delegueProtectionDonnees: { nom: '', fonction: '' },
    expertCybersecurite: { nom: '', fonction: '' },
    piloteProjet: { nom: '', fonction: '' },
    acteursHomologation: [],
    partiesPrenantes: {
      Hebergement: {
        nom: '',
        pointContact: '',
        natureAcces: '',
      },
      SecuriteService: {
        nom: '',
        pointContact: '',
        natureAcces: '',
      },
      DeveloppementFourniture: {
        nom: '',
        pointContact: '',
        natureAcces: '',
      },
      MaintenanceService: {
        nom: '',
        pointContact: '',
        natureAcces: '',
      },
    },
    partiesPrenantesSpecifiques: [],
  });

  const toutesPartiesPrenantes = Object.keys(
    contactsUtiles.partiesPrenantes
  ) as Array<TypePartiePrenante>;
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
</script>

<dsfr-tabs tabs={configurationsTabs}>
  <div slot="panel-1" class="conteneur-onglet">
    <div class="conteneur-avec-cadre">
      <h5>Autorité d'homologation</h5>
      <InputDSFR
        label="Prénom / Nom"
        bind:value={contactsUtiles.autoriteHomologation.nom}
      ></InputDSFR>
      <InputDSFR
        label="Fonction"
        bind:value={contactsUtiles.autoriteHomologation.fonction}
      ></InputDSFR>
    </div>

    <div class="conteneur-avec-cadre">
      <h5>Spécialiste cybersécurité</h5>
      <InputDSFR
        label="Prénom / Nom"
        bind:value={contactsUtiles.expertCybersecurite.nom}
      ></InputDSFR>
      <InputDSFR
        label="Fonction"
        bind:value={contactsUtiles.expertCybersecurite.fonction}
      ></InputDSFR>
    </div>

    <div class="conteneur-avec-cadre">
      <h5>Délégué·e à la protection des données à caractère personnel</h5>
      <InputDSFR
        label="Prénom / Nom"
        bind:value={contactsUtiles.delegueProtectionDonnees.nom}
      ></InputDSFR>
      <InputDSFR
        label="Fonction"
        bind:value={contactsUtiles.delegueProtectionDonnees.fonction}
      ></InputDSFR>
    </div>

    <div class="conteneur-avec-cadre">
      <h5>Responsables métier du projet</h5>
      <InputDSFR
        label="Prénom / Nom"
        bind:value={contactsUtiles.piloteProjet.nom}
      ></InputDSFR>
      <InputDSFR
        label="Fonction"
        bind:value={contactsUtiles.piloteProjet.fonction}
      ></InputDSFR>
    </div>

    {#each contactsUtiles.acteursHomologation as _, index (index)}
      <div class="conteneur-avec-cadre">
        <!-- svelte-ignore a11y_click_events_have_key_events, a11y_no_static_element_interactions -->
        <dsfr-button
          preset="close"
          label="Supprimer"
          class="bouton-suppression-contact"
          onclick={() => supprimeActeur(index)}
        ></dsfr-button>
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
      </div>
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
      <div class="conteneur-avec-cadre">
        <h5>{labelsPartiesPrenantes[typePartiePrenante]}</h5>
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
      </div>
    {/each}

    {#each contactsUtiles.partiesPrenantesSpecifiques as _, index (index)}
      <div class="conteneur-avec-cadre">
        <!-- svelte-ignore a11y_click_events_have_key_events, a11y_no_static_element_interactions -->
        <dsfr-button
          preset="close"
          label="Supprimer"
          class="bouton-suppression-contact"
          onclick={() => supprimePartiePrenante(index)}
        ></dsfr-button>

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
      </div>
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

<style lang="scss">
  .conteneur-onglet {
    display: flex;
    flex-direction: column;
    gap: 24px;

    .conteneur-avec-cadre {
      position: relative;
      max-width: 924px;
      border: 1px solid #ddd;
      padding: 24px;
      border-radius: 8px;
      display: flex;
      flex-direction: column;
      gap: 24px;
    }

    .bouton-suppression-contact {
      position: absolute;
      top: 12px;
      right: 24px;
      z-index: 1;
    }

    h5 {
      margin: 0;
      padding: 0;
      font-weight: 700;
      font-size: 1.375rem;
      line-height: 1.75;
    }
  }
</style>
