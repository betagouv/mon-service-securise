import { sendinblue } from './adaptateurEnvironnement.js';
import * as adaptateurTrackingSendinblue from './adaptateurTrackingSendinblue.js';
import { fabriqueAdaptateurTrackingMemoire } from './adaptateurTrackingMemoire.js';

const fabriqueAdaptateurTracking = () =>
  sendinblue().clefAPITracking()
    ? adaptateurTrackingSendinblue
    : fabriqueAdaptateurTrackingMemoire();

export default fabriqueAdaptateurTracking;
