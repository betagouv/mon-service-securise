import { render } from 'svelte/server';
import { chargeComposantSvelte } from '../../../src/apiPublique/documentation/chargeComposantSvelte.js';

describe("Le chargement d'un composant Svelte", () => {
  const urlComposant = new URL('./ComposantTest.svelte', import.meta.url);

  it('compile le fichier à la volée en un composant rendable côté serveur', async () => {
    const Salutation = await chargeComposantSvelte(urlComposant);

    const { body } = render(Salutation, { props: { prenom: 'Jeanne' } });

    expect(body).toContain('Bonjour Jeanne');
  });

  it('injecte le style du composant dans le <head>', async () => {
    const Salutation = await chargeComposantSvelte(urlComposant);

    const { head } = render(Salutation, { props: { prenom: 'Jeanne' } });

    expect(head).toContain('<style');
    expect(head).toContain('rebeccapurple');
  });
});
