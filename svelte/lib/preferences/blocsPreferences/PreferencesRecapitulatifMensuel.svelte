<script lang="ts">
  import BlocPreferences from './BlocPreferences.svelte';
  import { untrack } from 'svelte';
  import { api } from '../preferences.api';
  import type { RecapitulatifMensuel } from '../preferences.types';
  import LignePreference from '../LignePreference.svelte';

  interface Props {
    recapitulatifMensuel: RecapitulatifMensuel;
  }

  let { recapitulatifMensuel }: Props = $props();

  let nouveauxServicesAjoutesAuPerimetre = $state(
    untrack(() => recapitulatifMensuel.nouveauxServicesAjoutesAuPerimetre)
  );

  let tousLesRecapitulatifs = $derived(nouveauxServicesAjoutesAuPerimetre);

  const basculeTousRecapitulatifs = async (e: CustomEvent<boolean>) => {
    const valeurConsentement = e.detail;
    nouveauxServicesAjoutesAuPerimetre = valeurConsentement;
    await api.sauvegardePreferencesRecapitulatif({
      nouveauxServicesAjoutesAuPerimetre,
    });
  };
</script>

<BlocPreferences
  titre="Récapitulatif mensuel"
  sousTitre="Un e-mail envoyé le 1er de chaque mois pour faire le point sur les services de votre périmètre."
>
  {#snippet slotToggle()}
    <dsfr-toggle
      id="tous-recapitulatif-mensuels"
      label="{tousLesRecapitulatifs
        ? 'Désactiver'
        : 'Activer'} tous les récapitulatifs mensuels"
      hide-label
      checked={tousLesRecapitulatifs}
      onvaluechanged={basculeTousRecapitulatifs}
    ></dsfr-toggle>
  {/snippet}
  <LignePreference
    titre="De nouveaux services ont été ajoutés à mon périmètre"
    sousTitre="Le nombre de services créés ou partagés avec vous au cours du mois."
    icone="computer-line"
    avecBordure
    valeur={nouveauxServicesAjoutesAuPerimetre}
    onvaleurmodifiee={async (valeur) => {
      nouveauxServicesAjoutesAuPerimetre = valeur;
      await api.sauvegardePreferencesRecapitulatif({
        nouveauxServicesAjoutesAuPerimetre,
      });
    }}
  />
</BlocPreferences>
