<script lang="ts">
  const couleurs = ['#006CFA', '#05E4C5', '#ED1F7D', '#711CFF', '#FF9E2A'];

  const uneCouleur = couleurs[Math.floor(Math.random() * couleurs.length)];
  const dureeAnimation = 800;

  let confettiEl: HTMLElement;

  setTimeout(() => {
    confettiEl!.parentNode!.removeChild(confettiEl);
  }, dureeAnimation);

  const random = (max: number) => Math.random() * max;
</script>

<i
  bind:this={confettiEl}
  style="background: {uneCouleur}; animation: bang {dureeAnimation}ms ease-out forwards; transform: translate3d({random(
    500
  ) - 250}px, {random(200) - 150}px, 0) rotate({random(360)}deg);"
/>

<style>
  @keyframes -global-bang {
    from {
      transform: translate3d(0, 0, 0);
      opacity: 1;
    }
  }

  i {
    position: absolute;
    display: block;
    width: 3px;
    height: 8px;
    opacity: 0;
    top: 50%;
    left: 50%;
  }
</style>
