export const mascararCpf = (valor) => {
  const digits = valor.replace(/\D/g, '').slice(0, 11);
  if (digits.length <= 3) return digits;
  if (digits.length <= 6) return `${digits.slice(0,3)}.${digits.slice(3)}`;
  if (digits.length <= 9) return `${digits.slice(0,3)}.${digits.slice(3,6)}.${digits.slice(6)}`;
  return `${digits.slice(0,3)}.${digits.slice(3,6)}.${digits.slice(6,9)}-${digits.slice(9)}`;
};

export const ocultarCpf = (cpf) => {
  if (!cpf) return '';
  const digits = cpf.replace(/\D/g, '');
  if (digits.length !== 11) return cpf;
  return `${digits.slice(0,3)}.***.***-${digits.slice(9)}`;
};

export const mascararTelefone = (valor) => {
  const digits = valor.replace(/\D/g, '').slice(0, 11);
  if (digits.length <= 2) return digits.length ? `(${digits}` : '';
  if (digits.length <= 6) return `(${digits.slice(0,2)}) ${digits.slice(2)}`;
  if (digits.length <= 10) return `(${digits.slice(0,2)}) ${digits.slice(2,6)}-${digits.slice(6)}`;
  return `(${digits.slice(0,2)}) ${digits.slice(2,7)}-${digits.slice(7)}`;
};

export const formatarData = (data) => {
  if (!data) return '';
  const [ano, mes, dia] = data.split('-');
  return `${dia}/${mes}/${ano}`;
};

export const formatarProntuario = (num) => {
  if (!num) return '—';
  return `PRN-${String(num).padStart(6, '0')}`;
};

export const formatarTipo = (tipo) => {
  const map = {
    enfermaria: 'Enfermaria',
    uti: 'UTI',
    'semi-intensivo': 'Semi-Intensivo',
    isolamento: 'Isolamento',
    pediatrico: 'Pediátrico',
    obstetrico: 'Obstétrico'
  };
  return map[tipo] || tipo;
};

export const formatarStatus = (status) => {
  if (status === 'disponivel') return 'Disponível';
  if (status === 'ocupado') return 'Ocupado';
  if (status === 'manutencao') return 'Manutenção';
  if (status === 'inativo') return 'Inativo';
  return status;
};
