import DoctrineHomologation from './DoctrineHomologation.svelte';
import { mount } from 'svelte';

const app = mount(DoctrineHomologation, {
  target: document.getElementById('doctrine-homologation')!,
});

export default app;
