<script lang="ts">
  import type { Notification } from '../../ui/types.d';
  import { storeNotifications } from '../../ui/stores/notifications.store';

  interface Props {
    notification: Notification;
  }

  let { notification }: Props = $props();

  let title = $derived(
    notification.type === 'nouveaute' ? notification.titre : notification.entete
  );
  let description = $derived(
    notification.type === 'nouveaute'
      ? notification.sousTitre
      : notification.titre
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
  {title}
  {description}
  has-description
  size="sm"
  horizontal
  href={notification.lien}
  has-buttons
  enlarge
  no-icon
  onclick={actionClick}
  has-badge
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
    size="md"
    label="À faire"
    type="accent"
    accent="blue-cumulus"
  ></dsfr-badge>
</dsfr-card>
