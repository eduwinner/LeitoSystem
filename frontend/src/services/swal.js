import Swal from 'sweetalert2';

export const confirmar = (titulo, texto, icone = 'warning') =>
  Swal.fire({
    title: titulo,
    text: texto,
    icon: icone,
    showCancelButton: true,
    confirmButtonColor: '#2563eb',
    cancelButtonColor: '#6b7280',
    confirmButtonText: 'Confirmar',
    cancelButtonText: 'Cancelar',
    reverseButtons: true
  });

export const confirmarExcluir = (titulo, texto) =>
  Swal.fire({
    title: titulo,
    text: texto,
    icon: 'warning',
    showCancelButton: true,
    confirmButtonColor: '#dc2626',
    cancelButtonColor: '#6b7280',
    confirmButtonText: 'Excluir',
    cancelButtonText: 'Cancelar',
    reverseButtons: true
  });

export const confirmarInativar = (texto) =>
  Swal.fire({
    title: 'Inativar leito?',
    text: texto,
    icon: 'warning',
    showCancelButton: true,
    confirmButtonColor: '#d97706',
    cancelButtonColor: '#6b7280',
    confirmButtonText: 'Inativar',
    cancelButtonText: 'Cancelar',
    reverseButtons: true
  });

export const confirmarLiberar = (bedNumero, pacienteNome) =>
  Swal.fire({
    title: 'Liberar leito?',
    html: `<b>${bedNumero}</b>${pacienteNome ? ` — ${pacienteNome}` : ''}<br><small style="color:#6b7280">Esta ação não pode ser desfeita.</small>`,
    icon: 'warning',
    showCancelButton: true,
    confirmButtonColor: '#7c3aed',
    cancelButtonColor: '#6b7280',
    confirmButtonText: 'Liberar',
    cancelButtonText: 'Cancelar',
    reverseButtons: true
  });
