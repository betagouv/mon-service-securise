import lisDonneesPartagees from '../modules/donneesPartagees.mjs';

$(() => {
  const descriptionService = lisDonneesPartagees('donnees-description-service');
  const lectureSeule = lisDonneesPartagees('donnees-lecture-seule');
  document.body.dispatchEvent(
    new CustomEvent('svelte-recharge-decrire-v2', {
      detail: { descriptionService, lectureSeule },
    })
  );
});
