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
          blank: true,
          badge: {
            couleur: 'yellow-moutarde',
            icone: 'flashlight-fill',
            libelle: 'Nouveauté',
          },
        }
      : {
          titre: notification.entete,
          description: notification.titre,
          badge: {
            couleur: 'blue-cumulus',
            libelle: 'À faire',
          },
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
  has-badge
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
  <dsfr-badge
    slot="badgesgroup"
    size="sm"
    label={configurationCarte.badge.libelle}
    type="accent"
    accent={configurationCarte.badge.couleur}
    has-icon={!!configurationCarte.badge.icone}
    icon={configurationCarte.badge.icone}
  ></dsfr-badge>
</dsfr-card>
