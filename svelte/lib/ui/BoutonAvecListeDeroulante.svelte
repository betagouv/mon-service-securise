<script lang="ts" module>
  export type OptionBoutonListeDeroulante = {
    label: string;
    icone: string;
    href?: string;
    action?: () => void;
  };
</script>

<script lang="ts">
  import { cibleDeVisiteGuidee } from '../visiteGuidee/ciblage';

  interface Props {
    titre: string;
    options: OptionBoutonListeDeroulante[];
    disabled?: boolean;
    aligneADroite?: boolean;
    idVisiteGuidee?: string;
  }

  let {
    titre,
    options,
    disabled = false,
    aligneADroite = false,
    idVisiteGuidee = '',
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
  button-kind="primary"
  button-size="md"
  button-icon="add-line"
  content-type="buttons"
  align={aligneADroite ? 'right' : 'left'}
  items={optionsPourDropdown}
  onitemclicked={executeAction}
  {disabled}
  {@attach idVisiteGuidee !== '' && cibleDeVisiteGuidee(idVisiteGuidee)}
>
</dsfr-dropdown>
