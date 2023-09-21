import GestionContributeurs from './GestionContributeurs.svelte';
import type {
  GestionContributeursProps,
  Service,
} from './gestionContributeurs.d';
import { store } from './gestionContributeurs.store';

document.body.addEventListener(
  'svelte-recharge-contributeurs',
  (e: CustomEvent<GestionContributeursProps>) => rechargeApp({ ...e.detail })
);

let app: GestionContributeurs;

const reinitialiseStore = (services: Service[]) => {
  store.reinitialise(services);
};

const rechargeApp = (props: GestionContributeursProps) => {
  app?.$destroy();
  reinitialiseStore(props.services);
  app = new GestionContributeurs({
    target: document.getElementById('conteneur-gestion-contributeurs')!,
  });
};

export default app;
