import { z } from 'zod';

const mmJJaaaa = /^(0?[1-9]|1[0-2])\/(0?[1-9]|[12][0-9]|3[01])\/\d{4}$/;

export const schemaDate = {
  mmJJaaaa: () =>
    z
      .string()
      .regex(mmJJaaaa, 'La date doit être au format mm/jj/aaaa')
      .refine((value) => {
        const [mm, dd, yyyy] = value.split('/').map(Number);
        const date = new Date(yyyy, mm - 1, dd);
        return (
          date.getFullYear() === yyyy &&
          date.getMonth() === mm - 1 &&
          date.getDate() === dd
        );
      }, 'Date invalide'),
  uneDateValideEnChaine: () =>
    z
      .string()
      .refine(
        (chaineDate) => !Number.isNaN(new Date(chaineDate).valueOf()),
        'Date invalide'
      ),
};
