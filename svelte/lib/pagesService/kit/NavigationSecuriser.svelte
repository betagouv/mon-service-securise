<script lang="ts">
  import { untrack } from 'svelte';
  import { pageCourante, routeurStore } from '../store/routeur.store';

  interface Props {
    idService: string;
  }

  let { idService }: Props = $props();

  const configurationNav = untrack(() => [
    {
      label: 'Mesures de sécurité',
      href: `/service/${idService}/mesures`,
      current: $pageCourante === 'mesures',
    },
    {
      label: 'Indice Cyber',
      href: `/service/${idService}/indiceCyber`,
      current: $pageCourante === 'indiceCyber',
    },
  ]);

  type TabnavLink = { href: string };
  const gereClicNavigation = (e: CustomEvent<{ link: TabnavLink }>) => {
    routeurStore.navigue(e.detail.link.href);
  };
</script>

<dsfr-tabnav
  links={configurationNav}
  aria-label="Navigation dans Sécuriser"
  onlinkclicked={gereClicNavigation}
  routerMode
></dsfr-tabnav>

<style lang="scss">
  dsfr-tabnav {
    margin-top: -2rem;
  }
</style>
