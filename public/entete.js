import brancheMenuSandwich from './modules/interactions/brancheMenuSandwich.js';

$(() => {
  brancheMenuSandwich();
  document.body.dispatchEvent(new CustomEvent('svelte-recharge-entete'));
});
