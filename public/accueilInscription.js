$(() => {
  const $invite = $('#invite');
  const { invite } = JSON.parse($invite.text());

  document.body.dispatchEvent(
    new CustomEvent('svelte-recharge-accueil-inscription', {
      detail: { invite },
    })
  );
});
