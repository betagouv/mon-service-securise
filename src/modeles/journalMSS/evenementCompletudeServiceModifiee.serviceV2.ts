import Service from '../service.js';
import { AdaptateurChiffrement } from '../../adaptateurs/adaptateurChiffrement.interface.js';

export const completudeV2 = (
  service: Service,
  adaptateurChiffrement: AdaptateurChiffrement
) => {
  const niveauSecuriteMinimal = service.estimeNiveauDeSecurite();

  return {
    idService: adaptateurChiffrement.hacheSha256(service.id),
    niveauSecuriteMinimal,
  };
};
