import VisiteGuideeCreationService from './VisiteGuideeCreationService.svelte';
import { mount } from 'svelte';

document.body.addEventListener(
  'svelte-recharge-visite-guidee-creation-service',
  () => rechargeApp()
);

let app: VisiteGuideeCreationService;
const rechargeApp = () => {
  app = mount(VisiteGuideeCreationService, {
    target: document.getElementById('visite-guidee-creation-service')!,
  });
};

export default app!;
