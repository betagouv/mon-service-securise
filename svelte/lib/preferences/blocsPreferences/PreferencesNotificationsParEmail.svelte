<script lang="ts">
  import LignePreference from '../LignePreference.svelte';
  import BlocPreferences from './BlocPreferences.svelte';
</script>

<BlocPreferences
  titre="Notifications par e-mail"
  sousTitre="Ces alertes sont envoyées par e-mail. Vous ne pouvez pas les désactiver."
>
  {#snippet slotToggle()}
    <dsfr-toggle
      id="notifications-emails"
      label="Désactiver les notifications par email"
      hide-label
      checked
      disabled
    ></dsfr-toggle>
  {/snippet}

  <LignePreference
    titre="Invitations"
    sousTitre="Recevoir un e-mail lorsqu’un utilisateur vous invite à rejoindre un service."
    icone="mail-line"
    valeur={true}
    avecBordure
    inactif
  />
  <LignePreference
    titre="Homologation bientôt expirée"
    icone="alarm-warning-line"
    valeur={true}
    avecBordure
    inactif
  >
    {#snippet contenuRicheSousTitre()}
      Recevoir un e-mail lorsqu’une homologation arrive prochainement à
      expiration. <br /> La fréquence des rappels par e-mail dépend de la durée
      de l’homologation.
      <dsfr-link
        blank
        neutral
        label="En savoir plus"
        href="https://aide.monservicesecurise.cyber.gouv.fr/fr/article/les-mails-de-rappel-concernant-lexpiration-homologation-1wwnztj/"
      ></dsfr-link>
    {/snippet}
  </LignePreference>
  <LignePreference
    titre="Homologation expirée"
    sousTitre="Recevoir un e-mail lorsqu’une homologation arrive à échéance."
    icone="warning-line"
    valeur={true}
    avecBordure
    inactif
  />
  <LignePreference
    titre="Nouvelles fonctionnalités"
    sousTitre="Recevoir un e-mail pour être informé des nouvelles fonctionnalités de MonServiceSécurisé."
    icone="computer-line"
    valeur={true}
    inactif
  />
</BlocPreferences>
