<script lang="ts">
  import type { Notification } from '../../ui/types.d';
  import { routeurStore } from '../../pagesService/store/routeur.store';
  import { storeNotifications } from '../../ui/stores/notifications.store';

  interface Props {
    notification: Notification;
  }

  let { notification }: Props = $props();

  let configurationCarte = $derived.by(() => {
    if (notification.type === 'nouveaute') {
      return {
        titre: notification.titre,
        description: notification.sousTitre,
        src: `/statique/assets/images/notifications/illustrations/${notification.image}`,
        blank: true,
        badge: {
          couleur: 'yellow-moutarde',
          icone: 'flashlight-fill',
          libelle: 'Nouveauté',
        },
      };
    }
    if (notification.type === 'tache') {
      return {
        titre: notification.titre,
        description: notification.sousTitre,
        badge: {
          couleur: 'blue-cumulus',
          libelle: 'À faire',
        },
      };
    }
    if (notification.type === 'mention') {
      return {
        titre: notification.titre,
        description: notification.sousTitre,
        badge: {
          couleur: 'green-emeraude',
          libelle: 'Mention',
        },
      };
    }
    if (notification.type === 'assignation') {
      return {
        titre: notification.titre,
        description: notification.sousTitre,
        badge: {
          couleur: 'green-archipel',
          libelle: 'Assignation',
        },
      };
    }
    if (notification.type === 'echeanceProche') {
      return {
        titre: notification.titre,
        description: notification.sousTitre,
        badge: {
          couleur: 'yellow-tournesol',
          libelle: 'Échéance proche',
        },
      };
    }
    if (notification.type === 'echeanceAtteinte')
      return {
        titre: notification.titre,
        description: notification.sousTitre,
        badge: {
          couleur: 'pink-tuile',
          libelle: 'Échéance atteinte',
          icone: 'warning-fill',
        },
      };
    if (notification.type === 'invitation')
      return {
        titre: notification.titre,
        description: notification.sousTitre,
        badge: {
          couleur: 'green-bourgeon',
          libelle: 'Invitation',
        },
      };
    return {
      titre: '',
      description: '',
      badge: {
        couleur: '',
        libelle: '',
      },
    };
  });

  const actionVoirNotification = async (
    e: MouseEvent & { currentTarget: HTMLAnchorElement }
  ) => {
    const target = e.currentTarget.target;
    const href = e.currentTarget.href;
    if (target === '_self') {
      e.preventDefault();
    }
    if (notification.doitNotifierLecture)
      await storeNotifications.marqueLue(notification.type, notification.id);
    if (target === '_self') {
      routeurStore.navigue(href);
    }
  };

  const actionSupprimeNotification = () => {
    storeNotifications.supprime(notification.type, notification.id);
  };
</script>

<dsfr-card
  title={configurationCarte.titre}
  description={configurationCarte.description}
  has-description
  size="sm"
  horizontal
  blank={configurationCarte.blank}
  has-buttons
  no-link
  no-icon
  has-badge
  src={configurationCarte.src}
  image-ratio="1x1"
>
  <div class="boutons" slot="buttonsgroup">
    <!-- svelte-ignore a11y_click_events_have_key_events, a11y_no_static_element_interactions -->
    <dsfr-button
      kind="secondary"
      size="sm"
      has-icon
      href={notification.lien}
      markup="a"
      target={configurationCarte.blank ? '_blank' : undefined}
      onclick={actionVoirNotification}
      icon="arrow-right-line"
      icon-place="right"
      label={notification.titreCta}
    ></dsfr-button>
    {#if notification.supprimable}
      <!-- svelte-ignore a11y_click_events_have_key_events, a11y_no_static_element_interactions -->
      <dsfr-button
        kind="tertiary-no-outline"
        size="sm"
        label="Supprimer"
        onclick={actionSupprimeNotification}
      ></dsfr-button>
    {/if}
  </div>
  <div class="conteneur-badges" slot="badgesgroup">
    <dsfr-badge
      size="sm"
      label={configurationCarte.badge.libelle}
      type="accent"
      accent={configurationCarte.badge.couleur}
      has-icon={!!configurationCarte.badge.icone}
      icon={configurationCarte.badge.icone}
    ></dsfr-badge>
    {#if notification.statutLecture === 'nonLue'}
      <dsfr-badge
        size="sm"
        label="Non lue"
        type="accent"
        accent="purple-glycine"
      ></dsfr-badge>
    {/if}
  </div>
</dsfr-card>

<style>
  .conteneur-badges {
    display: flex;
    gap: 8px;
    margin-bottom: 12px;
  }
</style>
