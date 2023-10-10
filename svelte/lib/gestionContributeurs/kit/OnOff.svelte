<script lang="ts">
  import { createEventDispatcher } from 'svelte';

  export let id: string;
  export let checked: boolean;

  const dispatch = createEventDispatcher<{
    change: boolean;
  }>();

  const signaleChange = (event: Event) => {
    const checkbox = event.target as HTMLInputElement;
    dispatch('change', checkbox.checked);
  };
</script>

<div class="on-off">
  <input type="checkbox" {id} {checked} on:change={(e) => signaleChange(e)} />
  <label for={id}></label>
</div>

<style>
  /* Inspiration : https://codepen.io/alvarotrigo/pen/abVPyaJ */
  .on-off {
    display: flex;
  }

  input[type='checkbox'] {
    width: 0 !important;
    height: 0;
    margin: 0;
    transform: none;
    visibility: hidden;
  }

  label {
    cursor: pointer;
    width: 40px;
    height: 24px;
    background: white;
    display: block;
    border-radius: 15px;
    border: 1px solid #cbd5e1;
    position: relative;
    margin: 0 !important;
  }

  label:after {
    content: '';
    position: absolute;
    width: 22px;
    height: 22px;
    left: -1px;
    background: white;
    border: 1px solid #cbd5e1;
    border-radius: 15px;
    transition: 0.2s cubic-bezier(0, 0, 0.2, 1);
  }

  input:checked + label {
    background: #0079d0;
    border-color: #0079d0;
  }

  input:checked + label:after {
    left: calc(100% + 1px);
    transform: translateX(-100%);
    background-image: url('/statique/assets/images/icone_check.svg');
    background-repeat: no-repeat;
    background-position: center;
    border-color: #0079d0;
  }
</style>
