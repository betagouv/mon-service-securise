import { mount } from 'svelte';
import Observatoire from './Observatoire.svelte';

mount(Observatoire, {
  target: document.getElementById('conteneur-observatoire')!,
});
