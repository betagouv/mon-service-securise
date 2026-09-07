<script lang="ts">
  import BlocPreferences from './BlocPreferences.svelte';
  import { untrack } from 'svelte';
  import { api } from '../preferences.api';
  import type { RecapitulatifHebdomadaire } from '../preferences.types';
  import LignePreference from '../LignePreference.svelte';

  interface Props {
    recapitulatifHebdomadaire: RecapitulatifHebdomadaire;
  }

  let { recapitulatifHebdomadaire }: Props = $props();

  let mentionDansMesure = $state(
    untrack(() => recapitulatifHebdomadaire.mentionDansMesure)
  );

  let responsableMesure = $state(
    untrack(() => recapitulatifHebdomadaire.responsableMesure)
  );

  let echeanceMesureBientotExpiree = $state(
    untrack(() => recapitulatifHebdomadaire.echeanceMesureBientotExpiree)
  );

  let echeanceMesureExpiree = $state(
    untrack(() => recapitulatifHebdomadaire.echeanceMesureExpiree)
  );

  let tousLesRecapitulatifs = $derived(
    mentionDansMesure ||
      responsableMesure ||
      echeanceMesureBientotExpiree ||
      echeanceMesureExpiree
  );

  const basculeTousRecapitulatifs = async (e: CustomEvent<boolean>) => {
    const valeurConsentement = e.detail;
    mentionDansMesure = valeurConsentement;
    responsableMesure = valeurConsentement;
    echeanceMesureBientotExpiree = valeurConsentement;
    echeanceMesureExpiree = valeurConsentement;
    await api.sauvegardePreferencesRecapitulatif({
      mentionDansMesure,
      responsableMesure,
      echeanceMesureBientotExpiree,
      echeanceMesureExpiree,
    });
  };
</script>

<BlocPreferences
  titre="Récapitulatif hebdomadaire"
  sousTitre="Un e-mail envoyé chaque semaine pour regrouper vos notifications non lues."
>
  {#snippet slotToggle()}
    <dsfr-toggle
      id="tous-recapitulatif-hebdomadaire"
      label="{tousLesRecapitulatifs
        ? 'Désactiver'
        : 'Activer'} tous les récapitulatifs hebdomadaires"
      hide-label
      checked={tousLesRecapitulatifs}
      onvaluechanged={basculeTousRecapitulatifs}
    ></dsfr-toggle>
  {/snippet}
  <LignePreference
    titre="On me mentionne dans un commentaire"
    sousTitre="Lorsqu'un utilisateur vous mentionne dans un commentaire de mesure."
    icone="message-2-line"
    avecBordure
    valeur={mentionDansMesure}
    onvaleurmodifiee={async (valeur) => {
      mentionDansMesure = valeur;
      await api.sauvegardePreferencesRecapitulatif({
        mentionDansMesure,
      });
    }}
  />
  <LignePreference
    titre="On me nomme responsable d’une mesure"
    sousTitre="Lorsqu’un utilisateur vous désigne comme responsable d’une mesure de sécurité sur un service."
    icone="user-star-line"
    avecBordure
    valeur={responsableMesure}
    onvaleurmodifiee={async (valeur) => {
      responsableMesure = valeur;
      await api.sauvegardePreferencesRecapitulatif({
        responsableMesure,
      });
    }}
  />
  <LignePreference
    titre="Une mesure arrive bientôt à échéance"
    sousTitre="Deux semaines avant la date d’échéance d’une mesure."
    icone="alarm-warning-line"
    avecBordure
    valeur={echeanceMesureBientotExpiree}
    onvaleurmodifiee={async (valeur) => {
      echeanceMesureBientotExpiree = valeur;
      await api.sauvegardePreferencesRecapitulatif({
        echeanceMesureBientotExpiree,
      });
    }}
  />
  <LignePreference
    titre="Une mesure arrive à échéance aujourd’hui"
    sousTitre="Le jour de la date d’échéance d’une mesure."
    icone="warning-line"
    valeur={echeanceMesureExpiree}
    onvaleurmodifiee={async (valeur) => {
      echeanceMesureExpiree = valeur;
      await api.sauvegardePreferencesRecapitulatif({
        echeanceMesureExpiree,
      });
    }}
  />
  <dsfr-callout
    text="Si vous avez déjà lu toutes vos notifications dans MonServiceSécurisé, aucun e-mail ne vous est envoyé."
    has-icon
    icon="info-line"
    accent="blue-cumulus"
  ></dsfr-callout>
</BlocPreferences>

<style lang="scss">
  dsfr-callout {
    margin-top: 16px;
    margin-bottom: -56px;
  }
</style>
