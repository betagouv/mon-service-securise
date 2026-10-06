<script lang="ts" module>
  export type OptionBoutonListeDeroulante = {
    label: string;
    icone: string;
    href?: string;
    action?: () => void;
    disabled?: boolean;
  };
</script>

<script lang="ts">
  interface Props {
    titre?: string;
    options: OptionBoutonListeDeroulante[];
    disabled?: boolean;
    aligneADroite?: boolean;
    icone?: string;
    typeBouton?: 'primary' | 'secondary' | 'tertiary';
    tailleBouton?: 'sm' | 'md' | 'lg';
  }

  let {
    titre,
    options,
    disabled = false,
    aligneADroite = false,
    icone = 'add-line',
    typeBouton = 'primary',
    tailleBouton = 'md',
  }: Props = $props();

  let optionsPourDropdown = $derived(
    options.map((o) => ({ ...o, icon: o.icone }))
  );

  const executeAction = (
    e: CustomEvent<{ item: OptionBoutonListeDeroulante; index: number }>
  ) => {
    if (e.detail.item.href) {
      window.location.href = e.detail.item.href;
    } else {
      e.detail.item.action?.();
    }
  };
</script>

<dsfr-dropdown
  id="bouton-liste-deroulante"
  collapse-id="bouton-liste-deroulante-collapse"
  button-title={titre}
  button-kind={typeBouton}
  button-icon-place={titre ? 'left' : 'only'}
  button-size={tailleBouton}
  button-icon={icone}
  content-type="buttons"
  align={aligneADroite ? 'right' : 'left'}
  items={optionsPourDropdown}
  onitemclicked={executeAction}
  {disabled}
>
</dsfr-dropdown>
