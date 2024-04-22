import GestionContributeurs from './GestionContributeurs.svelte';
import type {
  GestionContributeursProps,
  Service,
} from './gestionContributeurs.d';
import { store } from './gestionContributeurs.store';
import { donneesServiceVisiteGuidee } from './modeVisiteGuidee/donneesVisiteGuidee';

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
  const { modeVisiteGuidee, services } = props;
  reinitialiseStore(modeVisiteGuidee ? [donneesServiceVisiteGuidee] : services);
  app = new GestionContributeurs({
    target: document.getElementById('conteneur-gestion-contributeurs')!,
    props: { modeVisiteGuidee },
  });
};

export default app!;
