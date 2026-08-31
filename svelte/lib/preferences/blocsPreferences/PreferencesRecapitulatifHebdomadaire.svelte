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

  let tousLesRecapitulatifs = $derived(mentionDansMesure);

  const basculeTousRecapitulatifs = async (e: CustomEvent<boolean>) => {
    const valeurConsentement = e.detail;
    mentionDansMesure = valeurConsentement;
    await api.sauvegardePreferencesRecapitulatif({
      mentionDansMesure,
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
    valeur={mentionDansMesure}
    onvaleurmodifiee={async (valeur) => {
      mentionDansMesure = valeur;
      await api.sauvegardePreferencesRecapitulatif({
        mentionDansMesure,
      });
    }}
  />
</BlocPreferences>

<style lang="scss">
</style>
