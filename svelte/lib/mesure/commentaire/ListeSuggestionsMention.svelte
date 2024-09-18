<script lang="ts">
  import type { Contributeur } from '../../tableauDesMesures/tableauDesMesures.d';

  export let items: Contributeur[];
  export let callback: (c: Contributeur) => void;

  let activeIdx = 0;

  export function onKeyDown(event: KeyboardEvent) {
    if (event.repeat) {
      return false;
    }

    switch (event.key) {
      case 'ArrowUp':
        activeIdx = (activeIdx + items.length - 1) % items.length;
        return true;
      case 'ArrowDown':
        activeIdx = (activeIdx + 1) % items.length;
        return true;
      case 'Enter':
        callback(items[activeIdx]);
        return true;
    }

    return false;
  }
</script>

<ul>
  {#each items as item, i}
    <li>
      <span class:active={i === activeIdx}>
        {item.prenomNom}
      </span>
    </li>
  {/each}
</ul>
