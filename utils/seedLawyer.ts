import { Role } from '../types';
import { STORAGE_KEYS } from './settingsPersistence';

export const seedLawyer = () => {
  if (localStorage.getItem(STORAGE_KEYS.LAWYER)) return;

  const emptyLawyer = {
    id: 'lawyer-default',
    name: 'Nome do Advogado',
    email: 'email@exemplo.com',
    role: Role.ADMIN,
    oab: '',
    phone: '',
    specialty: '',
    bio: '',
    photo_url: '',
    office_id: 'office-default',
  };

  const emptyOffice = {
    id: 'office-default',
    name: 'Nome do Escritório',
    cnpj: '',
    address: '',
    phone: '',
    email: '',
    site: '',
    logo_url: '',
  };

  localStorage.setItem(STORAGE_KEYS.LAWYER, JSON.stringify(emptyLawyer));
  localStorage.setItem(STORAGE_KEYS.OFFICE, JSON.stringify(emptyOffice));
  localStorage.setItem(STORAGE_KEYS.SESSION, JSON.stringify(emptyLawyer));
};
