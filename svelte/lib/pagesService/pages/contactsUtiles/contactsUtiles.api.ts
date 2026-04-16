import type { ContactsUtiles } from './contactsUtiles.types';

export const metsAJourContactsUtiles = async (
  idService: string,
  donnees: ContactsUtiles
) => {
  await axios.post(`/api/service/${idService}/rolesResponsabilites`, donnees);
};
