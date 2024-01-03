$(() => {
  const { indiceCyber, noteMax } = JSON.parse($('#indice-cyber').text());

  document.body.dispatchEvent(
    new CustomEvent('svelte-recharge-indice-cyber', {
      detail: { indiceCyber, noteMax },
    })
  );
});
