import GestionContributeurs from './GestionContributeurs.svelte';
import type {
  GestionContributeursProps,
  Service,
} from './gestionContributeurs.d';
import { gestionContributeursStore } from './gestionContributeurs.store';

document.body.addEventListener(
  'svelte-recharge-contributeurs',
  (e: CustomEvent<GestionContributeursProps>) => rechargeApp({ ...e.detail })
);

let app: GestionContributeurs;

const reinitialiseStore = (services: Service[]) => {
  gestionContributeursStore.reinitialise(services);
};

const rechargeApp = (props: GestionContributeursProps) => {
  app?.$destroy();
  reinitialiseStore(props.services);
  app = new GestionContributeurs({
    target: document.getElementById('conteneur-gestion-contributeurs')!,
  });
};

export default app;
