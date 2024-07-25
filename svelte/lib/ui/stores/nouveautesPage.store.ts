import { derived } from 'svelte/store';
import { storeNotifications } from './notifications.store';

type NouveautesPage = {
  doitAfficherNouveautePourPage: (idNouveaute: string) => boolean;
};

export const nouveautesPage = derived<
  typeof storeNotifications,
  NouveautesPage
>(storeNotifications, ($storeNotifications) => {
  const idsNouveautesNonLues = $storeNotifications.pourPage
    .filter((nouveaute) => nouveaute.statutLecture === 'nonLue')
    .map((nouveaute) => nouveaute.id);
  return {
    doitAfficherNouveautePourPage: (idNouveaute: string) => {
      return idsNouveautesNonLues.includes(idNouveaute);
    },
  };
});
