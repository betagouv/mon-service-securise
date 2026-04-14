<script lang="ts">
  import CarteDePromotion from './CarteDePromotion.svelte';
  import { SvelteDate } from 'svelte/reactivity';

  interface Props {
    dateInscriptionUtilisateur: Date;
  }

  let { dateInscriptionUtilisateur }: Props = $props();

  const ilYA1Mois = new SvelteDate().setMonth(new Date().getMonth() - 1);
  let utilisateurInscritDepuisPlusD1Mois = $derived(
    dateInscriptionUtilisateur.getTime() < ilYA1Mois
  );
</script>

<h2>Des contenus qui pourraient vous intéresser</h2>
<div class="conteneur-liens-blog">
  {#if utilisateurInscritDepuisPlusD1Mois}
    <CarteDePromotion
      titre="🚀 Promouvoir MonServiceSécurisé"
      href="/faire-connaitre-et-recommander-monservicesecurise"
    >
      Vous appréciez MonServiceSécurisé ? N'hésitez pas à en parler autour de
      vous !
    </CarteDePromotion>
  {:else}
    <CarteDePromotion
      titre="Notre équipe est à votre écoute"
      href="https://calendly.com/fabien-giraud/presentation-de-monservicesecurise-1"
    >
      {#snippet illustration()}
        <img
          alt=""
          src="/statique/assets/images/tableauDeBord/image_equipe_webinaire.png"
          width="78"
        />
      {/snippet}
      Nous vous guiderons dans la découverte et prise en main de MonServiceSécurisé
      au sein de votre organisation.
    </CarteDePromotion>
  {/if}

  <CarteDePromotion
    titre="Rejoignez la communauté"
    href="https://tally.so/r/wa6o22"
  >
    {#snippet illustration()}
      <img
        src="/statique/assets/images/tableauDeBord/image_rejoignez_communaute.svg"
        alt=""
      />
    {/snippet}
    <b>Échangez</b> directement avec vos pairs pour une collaboration facilitée.
  </CarteDePromotion>

  <CarteDePromotion
    titre="Découvrez MesServicesCyber !"
    href="https://messervices.cyber.gouv.fr/"
    fondIllustration="jaune"
  >
    {#snippet illustration()}
      <img
        src="/statique/assets/images/tableauDeBord/image_promotion_msc.png"
        width="135"
        alt=""
      />
    {/snippet}
    MesServicesCyber, la plateforme pour faciliter l'accès de tous aux services et
    ressources de l'ANSSI et de ses partenaires.
  </CarteDePromotion>
</div>

<style>
  .conteneur-liens-blog {
    display: flex;
    gap: 24px;
  }

  h2 {
    font-size: 1.375rem;
    line-height: 1.75rem;
    font-weight: bold;
    margin-top: 32px;
  }
</style>
