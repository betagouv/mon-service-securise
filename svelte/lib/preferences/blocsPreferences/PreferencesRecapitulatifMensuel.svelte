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

  let nouveauxServicesSansToutesMesuresSpecifiques = $state(
    untrack(
      () => recapitulatifMensuel.nouveauxServicesSansToutesMesuresSpecifiques
    )
  );

  let tousLesRecapitulatifs = $derived(nouveauxServicesAjoutesAuPerimetre);

  const basculeTousRecapitulatifs = async (e: CustomEvent<boolean>) => {
    await basculeNouveauxServices(e.detail);
  };

  const basculeNouveauxServices = async (valeur: boolean) => {
    nouveauxServicesAjoutesAuPerimetre = valeur;
    if (!valeur) {
      nouveauxServicesSansToutesMesuresSpecifiques = valeur;
    }
    await api.sauvegardePreferencesRecapitulatif({
      nouveauxServicesAjoutesAuPerimetre,
      nouveauxServicesSansToutesMesuresSpecifiques,
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
    onvaleurmodifiee={basculeNouveauxServices}
  />
  <LignePreference
    titre="Un service n’a pas mes mesures"
    icone="warning-line"
    inactif={!nouveauxServicesAjoutesAuPerimetre}
    valeur={nouveauxServicesSansToutesMesuresSpecifiques}
    onvaleurmodifiee={async (valeur) => {
      nouveauxServicesSansToutesMesuresSpecifiques = valeur;
      await api.sauvegardePreferencesRecapitulatif({
        nouveauxServicesSansToutesMesuresSpecifiques,
      });
    }}
  >
    {#snippet contenuRicheSousTitre()}
      Le nombre de services qui n’ont pas toutes les mesures que vous avez
      ajoutées. Même réglage que la case de la fenêtre «&nbsp;Appliquer à tous
      les services&nbsp;».
      {#if !nouveauxServicesAjoutesAuPerimetre}<div class="message-info">
          <lab-anssi-icone taille="sm" nom="info-line"></lab-anssi-icone>La
          notification sur les mesures manquantes est désactivée, car elle
          dépend de la notification sur les nouveaux services.
        </div>{/if}
    {/snippet}
  </LignePreference>
</BlocPreferences>

<style lang="scss">
  .message-info {
    display: flex;
    gap: 4px;
    align-items: center;
    color: #0063cb;
    margin-top: 16px;
  }
</style>
