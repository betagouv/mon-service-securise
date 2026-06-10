import { mount } from 'svelte';
import AdminAdministrateurs from './AdminAdministrateurs.svelte';

const app = mount(AdminAdministrateurs, {
  target: document.getElementById('conteneur-admin-administrateurs')!,
});

export default app;
