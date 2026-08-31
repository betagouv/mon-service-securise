<script lang="ts">
  import type { PreferencesProps } from './preferences.types';
  import PreferencesNotificationsParEmail from './blocsPreferences/PreferencesNotificationsParEmail.svelte';
  import PreferencesConsentements from './blocsPreferences/PreferencesConsentements.svelte';
  import PreferencesRecapitulatifHebdomadaire from './blocsPreferences/PreferencesRecapitulatifHebdomadaire.svelte';

  let { consentements, recapitulatifHebdomadaire }: PreferencesProps = $props();
</script>

<h1>Préférences</h1>
<p>
  Les notifications dans MonServiceSécurisé sont toujours actives. Vous
  choisissez ici ce qui vous est envoyé par e-mail.
</p>
<div class="conteneur-blocs">
  <PreferencesRecapitulatifHebdomadaire {recapitulatifHebdomadaire} />
  <hr />
  <PreferencesNotificationsParEmail />
  <hr />
  <PreferencesConsentements {consentements} />
</div>

<style lang="scss">
  :global(main:has(#conteneur-preferences)) {
    background: white;
    text-align: left;
  }

  :global(#conteneur-preferences) {
    width: 792px;
  }

  .conteneur-blocs {
    display: flex;
    flex-direction: column;
    gap: 24px;
    padding: 56px 0;
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

  hr {
    border-top: none;
    border-bottom: 1px solid #dddddd;
    width: 100%;
  }
</style>
