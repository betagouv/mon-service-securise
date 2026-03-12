/* eslint-disable no-console, no-await-in-loop */
import axios, { AxiosError } from 'axios';
import { sendinblue } from '../src/adaptateurs/adaptateurEnvironnement.js';
import { enCadence } from '../src/utilitaires/pThrottle.js';

const urlBase = 'https://api.brevo.com';

export class ConsoleBrevo {
  private readonly cleApi: string;

  constructor() {
    const cleApi = sendinblue().clefAPIEmail();
    if (!cleApi)
      throw new Error(
        "Aucune clé d'API récupérée depuis l'environnement. Cette clé est nécessaire pour utiliser la Console Brevo."
      );

    this.cleApi = cleApi;
  }

  private enteteJson() {
    return {
      'api-key': this.cleApi,
      accept: 'application/json',
      'content-type': 'application/json',
    };
  }

  private async recupereTousLesContacts(): Promise<
    Array<{ id: string; numeroTelephone?: string }>
  > {
    const tous = [];

    const url = new URL(`/v3/contacts`, urlBase);

    let offset = 0;
    while (true) {
      const resultat = await axios.get(url.toString(), {
        headers: this.enteteJson(),
        params: { limit: 1_000, offset },
      });

      tous.push(...resultat.data.contacts);
      offset += resultat.data.contacts.length;

      console.log('📖 LE NOMBRE : ', resultat.data.contacts.length);
      console.log('📖 LE TOTAL : ', resultat.data.count);
      console.log('🥁 COMBIEN DANS LA COLLECTION : ', tous.length);
      console.log('---------------');

      if (tous.length >= resultat.data.count) break;
    }

    return tous.map((contact) => ({
      id: contact.id,
      numeroTelephone: contact.attributes.SYNC_MSS_NUMERO_TELEPHONE,
    }));
  }

  async migreAttributSms() {
    const tous = await this.recupereTousLesContacts();
    const avecTel = tous.filter(
      (contact) => !!contact.numeroTelephone
    ) as Array<{ id: string; numeroTelephone: string }>;

    console.log(
      `⚖️  ON A ${tous.length} contacts. 📞  ${avecTel.length} qui ont un numéro de tel`
    );

    const migreUnContact = async (id: string, tel: string) => {
      try {
        const url = new URL(`/v3/contacts/${id}`, urlBase);
        await axios.put(
          url.toString(),
          { attributes: { SMS: tel } },
          { headers: this.enteteJson() }
        );
        console.log(`➡️ ${id} OK`);
      } catch (e) {
        const x = e as AxiosError<{ message: string }>;
        console.log(`💥 Erreur pour ${id} : `, x?.response?.data?.message);
      }
    };

    const migreEnCadence = enCadence(150, migreUnContact);

    await Promise.all(
      avecTel.map(async (contact) => {
        await migreEnCadence(contact.id, contact.numeroTelephone);
      })
    );

    console.log('✅ FIN');
  }
}
