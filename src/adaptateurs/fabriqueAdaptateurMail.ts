import { sendinblue } from './adaptateurEnvironnement.js';
import { adaptateurMailSendinblue } from './adaptateurMailSendinblue.js';
import { fabriqueAdaptateurMailMemoire } from './adaptateurMailMemoire.js';
import { AdaptateurMail } from './adaptateurMail.interface.js';

export const fabriqueAdaptateurMail = (): AdaptateurMail =>
  sendinblue().clefAPIEmail()
    ? adaptateurMailSendinblue
    : fabriqueAdaptateurMailMemoire();
