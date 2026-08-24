<script lang="ts">
  import type { Notification } from '../../ui/types.d';
  import { storeNotifications } from '../../ui/stores/notifications.store';

  interface Props {
    notification: Notification;
  }

  let { notification }: Props = $props();

  let configurationCarte = $derived(
    notification.type === 'nouveaute'
      ? {
          titre: notification.titre,
          description: notification.sousTitre,
          src: `/statique/assets/images/notifications/illustrations/${notification.image}`,
          hasHeaderBadge: true,
          blank: true,
        }
      : {
          titre: notification.entete,
          description: notification.titre,
          hasBadge: true,
        }
  );

  let actionClick = $derived(
    notification.doitNotifierLecture
      ? async () => {
          await storeNotifications.marqueLue(
            notification.type,
            notification.id
          );
        }
      : () => {}
  );
</script>

<!-- svelte-ignore a11y_click_events_have_key_events, a11y_no_static_element_interactions -->
<dsfr-card
  title={configurationCarte.titre}
  description={configurationCarte.description}
  has-description
  size="sm"
  horizontal
  href={notification.lien}
  blank={configurationCarte.blank}
  has-buttons
  enlarge
  no-icon
  onclick={actionClick}
  has-badge={configurationCarte.hasBadge}
  has-header-badge={configurationCarte.hasHeaderBadge}
  src={configurationCarte.src}
  image-ratio="1x1"
>
  <dsfr-button
    slot="buttonsgroup"
    kind="tertiary"
    size="sm"
    has-icon
    icon="arrow-right-line"
    icon-place="right"
    label={notification.titreCta}
  ></dsfr-button>
  {#if configurationCarte.hasBadge}
    <dsfr-badge
      slot="badgesgroup"
      size="sm"
      label="À faire"
      type="accent"
      accent="blue-cumulus"
    ></dsfr-badge>
  {/if}
  {#if configurationCarte.hasHeaderBadge}
    <dsfr-badge
      slot="headerbadges"
      size="sm"
      label="Nouveautés"
      type="accent"
      accent="yellow-moutarde"
      has-icon
      icon="flashlight-fill"
    ></dsfr-badge>
  {/if}
</dsfr-card>
