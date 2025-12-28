import Dexie, { Table } from 'dexie';
import { FormSchema, FormSubmission } from '../types';

export class KuestionnaireDB extends Dexie {
  forms!: Table<FormSchema>;
  submissions!: Table<FormSubmission>;

  constructor() {
    super('KuestionnaireDB');
    this.version(1).stores({
      forms: 'id', // Primary key 'id'
      submissions: 'id, formId', // Primary key 'id', and 'formId' is indexed
    });
  }
}

export const db = new KuestionnaireDB();
