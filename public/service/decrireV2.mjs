import lisDonneesPartagees from '../modules/donneesPartagees.mjs';

$(() => {
  const { idService, descriptionService } = lisDonneesPartagees(
    'donnees-description-service'
  );
  const lectureSeule = lisDonneesPartagees('donnees-lecture-seule');
  const doitFinaliserDescription = lisDonneesPartagees(
    'donnees-doit-finaliser-description'
  );
  document.body.dispatchEvent(
    new CustomEvent('svelte-recharge-decrire-v2', {
      detail: {
        idService,
        descriptionService,
        lectureSeule,
        doitFinaliserDescription,
      },
    })
  );
});
