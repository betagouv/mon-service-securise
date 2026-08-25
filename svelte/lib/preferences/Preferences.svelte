<script lang="ts">
  import type { PreferencesProps } from './preferences.types';
  import LignePreference from './LignePreference.svelte';
  import { api } from './preferences.api';

  let {
    infolettreAcceptee,
    pixelDeSuiviAccepte,
    transactionnelAccepte,
  }: PreferencesProps = $props();

  let tousLesConsentements = $derived(
    infolettreAcceptee || transactionnelAccepte || pixelDeSuiviAccepte
  );

  const basculeTousConsentements = async (e: CustomEvent<boolean>) => {
    const valeurConsentement = e.detail;
    infolettreAcceptee = valeurConsentement;
    transactionnelAccepte = valeurConsentement;
    pixelDeSuiviAccepte = valeurConsentement;
    await api.sauvegardePreferences({
      infolettreAcceptee,
      transactionnelAccepte,
      pixelDeSuiviAccepte,
    });
  };
</script>

<h1>Préférences</h1>
<p>
  Les notifications dans MonServiceSécurisé sont toujours actives. Vous
  choisissez ici ce qui vous est envoyé par e-mail.
</p>
<div class="bloc-preferences">
  <div class="entete-preferences">
    <div class="titre-preferences">
      <h2>Mes consentements</h2>
      <p>
        Gérez vos préférences concernant les communications et l’utilisation de
        vos données.
      </p>
    </div>
    <dsfr-toggle
      id="tous-consentements"
      label="{tousLesConsentements
        ? 'Désactiver'
        : 'Activer'} tous les consentements"
      hide-label
      checked={tousLesConsentements}
      onvaluechanged={basculeTousConsentements}
    ></dsfr-toggle>
  </div>
  <div class="contenu-preferences">
    <LignePreference
      titre="Lettre d'information"
      sousTitre="Recevoir la lettre d’information MonServiceSécurisé."
      icone="newspaper-line"
      valeur={infolettreAcceptee}
      avecBordure
      onvaleurmodifiee={async (valeur) => {
        infolettreAcceptee = valeur;
        await api.sauvegardePreferences({ infolettreAcceptee });
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
        await api.sauvegardePreferences({ transactionnelAccepte });
      }}
    />
    <LignePreference
      titre="Mesurer l’ouverture de mes e-mails"
      sousTitre="Autoriser la mesure de l’ouverture des e-mails afin d’améliorer la pertinence des communications."
      icone="mail-line"
      valeur={pixelDeSuiviAccepte}
      onvaleurmodifiee={async (valeur) => {
        pixelDeSuiviAccepte = valeur;
        await api.sauvegardePreferences({ pixelDeSuiviAccepte });
      }}
    />
  </div>
</div>

<style lang="scss">
  :global(main) {
    background: white;
    text-align: left;
  }

  :global(#conteneur-preferences) {
    width: 792px;
  }

  h1 {
    color: #161616;
    font-size: 2rem;
    line-height: 2.5rem;
    margin: 56px 0 0;
    padding: 0;
    text-align: left;
  }

  p {
    padding: 0;
    color: #3a3a3a;
    font-size: 1.25rem;
    line-height: 2rem;
    margin: 16px 0 0;
  }

  .bloc-preferences {
    margin-top: 56px;

    .contenu-preferences {
      padding: 32px 0;
    }

    .entete-preferences {
      display: flex;
      justify-content: space-between;
    }

    h2 {
      color: #161616;
      font-size: 1.375rem;
      line-height: 1.75rem;
      margin: 0;
    }

    p {
      padding: 0;
      color: #3a3a3a;
      font-size: 0.875rem;
      line-height: 1.5rem;
      margin: 8px 0 0;
    }
  }
</style>
