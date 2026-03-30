<script lang="ts">
  import type { MenuNavigationServiceProps } from './menuNavigationService.d';
  import { tiroirStore } from '../ui/stores/tiroir.store';
  import TiroirTelechargementDocumentsService, {
    type DonneesServicePourTelechargementDocuments,
  } from '../ui/tiroirs/TiroirTelechargementDocumentsService.svelte';
  import { onMount } from 'svelte';

  let { visible, etapeActive, idService }: MenuNavigationServiceProps =
    $props();

  let service: DonneesServicePourTelechargementDocuments;
  onMount(async () => {
    const reponse = await axios.get<DonneesServicePourTelechargementDocuments>(
      `/api/service/${idService}`
    );
    service = reponse.data;
  });
</script>

<pre>{JSON.stringify(visible)}</pre>
<pre>{JSON.stringify(etapeActive)}</pre>
<div class="menu-navigation-service">
  <ul>
    {#if visible.mesures}
      <li>
        <a class="lien-navigation" href="/service/{idService}/mesures"
          >Sécuriser</a
        >
      </li>
    {/if}
    {#if visible.dossiers}
      <li>
        <a class="lien-navigation" href="/service/{idService}/dossiers"
          >Homologuer</a
        >
      </li>
    {/if}
    {#if visible.risques}
      <li>
        <a class="lien-navigation" href="/service/{idService}/risques"
          >Risques</a
        >
      </li>
    {/if}
    {#if visible.contactsUtiles}
      <li>
        <a
          class="lien-navigation"
          href="/service/{idService}/rolesResponsabilites">Contacts utiles</a
        >
      </li>
    {/if}
    <li>
      <button
        class="lien-navigation"
        onclick={() =>
          tiroirStore.afficheContenu(TiroirTelechargementDocumentsService, {
            service,
          })}>Documents</button
      >
    </li>
    {#if visible.descriptionService}
      <li>
        <a
          class="lien-navigation"
          href="/service/{idService}/descriptionService">Récapitulatif</a
        >
      </li>
    {/if}
  </ul>
</div>

<style lang="scss">
</style>
