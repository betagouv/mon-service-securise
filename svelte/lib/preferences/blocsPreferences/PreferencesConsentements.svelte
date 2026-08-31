<script lang="ts">
  import BlocPreferences from './BlocPreferences.svelte';
  import LignePreference from '../LignePreference.svelte';
  import type { Consentements } from '../preferences.types';
  import { untrack } from 'svelte';
  import { api } from '../preferences.api';
  interface Props {
    consentements: Consentements;
  }

  let { consentements }: Props = $props();

  let infolettreAcceptee = $state(
    untrack(() => consentements.infolettreAcceptee)
  );
  let transactionnelAccepte = $state(
    untrack(() => consentements.transactionnelAccepte)
  );
  let pixelDeSuiviAccepte = $state(
    untrack(() => consentements.pixelDeSuiviAccepte)
  );

  let tousLesConsentements = $derived(
    infolettreAcceptee || transactionnelAccepte || pixelDeSuiviAccepte
  );

  const basculeTousConsentements = async (e: CustomEvent<boolean>) => {
    const valeurConsentement = e.detail;
    infolettreAcceptee = valeurConsentement;
    transactionnelAccepte = valeurConsentement;
    pixelDeSuiviAccepte = valeurConsentement;
    await api.sauvegardePreferencesConsentements({
      infolettreAcceptee,
      transactionnelAccepte,
      pixelDeSuiviAccepte,
    });
  };
</script>

<BlocPreferences
  titre="Mes consentements"
  sousTitre="Gérez vos préférences concernant les communications et l’utilisation de vos données."
>
  {#snippet slotToggle()}
    <dsfr-toggle
      id="tous-consentements"
      label="{tousLesConsentements
        ? 'Désactiver'
        : 'Activer'} tous les consentements"
      hide-label
      checked={tousLesConsentements}
      onvaluechanged={basculeTousConsentements}
    ></dsfr-toggle>
  {/snippet}
  <LignePreference
    titre="Lettre d'information"
    sousTitre="Recevoir la lettre d’information MonServiceSécurisé."
    icone="newspaper-line"
    valeur={infolettreAcceptee}
    avecBordure
    onvaleurmodifiee={async (valeur) => {
      infolettreAcceptee = valeur;
      await api.sauvegardePreferencesConsentements({ infolettreAcceptee });
    }}
  />
  <LignePreference
    titre="Informations sur le service"
    sousTitre="Recevoir des informations sur l’utilisation et les évolutions de MonServiceSécurisé."
    icone="information-line"
    valeur={transactionnelAccepte}
    avecBordure
    onvaleurmodifiee={async (valeur) => {
      transactionnelAccepte = valeur;
      await api.sauvegardePreferencesConsentements({
        transactionnelAccepte,
      });
    }}
  />
  <LignePreference
    titre="Mesurer l’ouverture de mes e-mails"
    sousTitre="Autoriser la mesure de l’ouverture des e-mails afin d’améliorer la pertinence des communications."
    icone="mail-line"
    valeur={pixelDeSuiviAccepte}
    onvaleurmodifiee={async (valeur) => {
      pixelDeSuiviAccepte = valeur;
      await api.sauvegardePreferencesConsentements({ pixelDeSuiviAccepte });
    }}
  />
</BlocPreferences>
