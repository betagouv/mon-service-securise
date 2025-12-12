import VisiteGuideeCreationService from './VisiteGuideeCreationService.svelte';

document.body.addEventListener(
  'svelte-recharge-visite-guidee-creation-service',
  () => rechargeApp()
);

let app: VisiteGuideeCreationService;
const rechargeApp = () => {
  app = new VisiteGuideeCreationService({
    target: document.getElementById('visite-guidee-creation-service')!,
  });
};

export default app!;
