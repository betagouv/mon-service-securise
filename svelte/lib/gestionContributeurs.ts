import GestionContributeurs from './GestionContributeurs.svelte';
import type { GestionContributeursProps } from './gestionContributeurs.d';
import { gestionContributeursStore } from './gestionContributeurs.store';

document.body.addEventListener(
  'svelte-recharge-contributeurs',
  (e: CustomEvent<GestionContributeursProps>) => rechargeApp({ ...e.detail })
);

let app: GestionContributeurs;

const reinitialiseStore = () => {
  gestionContributeursStore.reinitialise();
};

const rechargeApp = (props: GestionContributeursProps) => {
  app?.$destroy();
  reinitialiseStore();
  app = new GestionContributeurs({
    target: document.getElementById('conteneur-gestion-contributeurs'),
    props,
  });
};

export default app;
