import { describe, it, expect } from 'vitest';
import {
  mascararCpf,
  ocultarCpf,
  mascararTelefone,
  formatarData,
  formatarProntuario,
  formatarTipo,
  formatarStatus
} from './formatters';

describe('mascararCpf', () => {
  it('formata CPF completo com pontos e traço', () => {
    expect(mascararCpf('12345678901')).toBe('123.456.789-01');
  });

  it('formata parcialmente enquanto digita', () => {
    expect(mascararCpf('123')).toBe('123');
    expect(mascararCpf('1234')).toBe('123.4');
    expect(mascararCpf('123456')).toBe('123.456');
    expect(mascararCpf('1234567')).toBe('123.456.7');
    expect(mascararCpf('123456789')).toBe('123.456.789');
    expect(mascararCpf('12345678900')).toBe('123.456.789-00');
  });

  it('ignora caracteres não numéricos', () => {
    expect(mascararCpf('123.456.789-01')).toBe('123.456.789-01');
    expect(mascararCpf('abc123')).toBe('123');
  });

  it('limita a 11 dígitos', () => {
    expect(mascararCpf('123456789012345')).toBe('123.456.789-01');
  });
});

describe('ocultarCpf', () => {
  it('oculta dígitos centrais do CPF', () => {
    expect(ocultarCpf('12345678901')).toBe('123.***.***-01');
  });

  it('aceita CPF formatado com máscara', () => {
    expect(ocultarCpf('123.456.789-01')).toBe('123.***.***-01');
  });

  it('retorna vazio para CPF vazio', () => {
    expect(ocultarCpf('')).toBe('');
    expect(ocultarCpf(null)).toBe('');
  });

  it('retorna o valor original se CPF inválido (não tem 11 dígitos)', () => {
    expect(ocultarCpf('12345')).toBe('12345');
  });
});

describe('mascararTelefone', () => {
  it('formata celular com 11 dígitos', () => {
    expect(mascararTelefone('11987654321')).toBe('(11) 98765-4321');
  });

  it('formata fixo com 10 dígitos', () => {
    expect(mascararTelefone('1133334444')).toBe('(11) 3333-4444');
  });

  it('formata parcialmente enquanto digita', () => {
    expect(mascararTelefone('11')).toBe('(11');
    expect(mascararTelefone('119')).toBe('(11) 9');
    expect(mascararTelefone('11987')).toBe('(11) 987');
  });

  it('ignora caracteres não numéricos', () => {
    expect(mascararTelefone('(11) 98765-4321')).toBe('(11) 98765-4321');
  });

  it('retorna vazio para entrada vazia', () => {
    expect(mascararTelefone('')).toBe('');
  });
});

describe('formatarData', () => {
  it('converte formato ISO para formato brasileiro', () => {
    expect(formatarData('1990-05-15')).toBe('15/05/1990');
    expect(formatarData('2000-01-01')).toBe('01/01/2000');
    expect(formatarData('1978-01-15')).toBe('15/01/1978');
  });

  it('retorna vazio para data nula ou indefinida', () => {
    expect(formatarData('')).toBe('');
    expect(formatarData(null)).toBe('');
    expect(formatarData(undefined)).toBe('');
  });
});

describe('formatarProntuario', () => {
  it('formata número com prefixo PRN e zeros à esquerda', () => {
    expect(formatarProntuario(1)).toBe('PRN-000001');
    expect(formatarProntuario(42)).toBe('PRN-000042');
    expect(formatarProntuario(123456)).toBe('PRN-123456');
  });

  it('retorna traço para valor nulo ou zero', () => {
    expect(formatarProntuario(null)).toBe('—');
    expect(formatarProntuario(undefined)).toBe('—');
    expect(formatarProntuario(0)).toBe('—');
  });
});

describe('formatarTipo', () => {
  it('retorna label correto para cada tipo', () => {
    expect(formatarTipo('enfermaria')).toBe('Enfermaria');
    expect(formatarTipo('uti')).toBe('UTI');
    expect(formatarTipo('semi-intensivo')).toBe('Semi-Intensivo');
    expect(formatarTipo('isolamento')).toBe('Isolamento');
    expect(formatarTipo('pediatrico')).toBe('Pediátrico');
    expect(formatarTipo('obstetrico')).toBe('Obstétrico');
  });

  it('retorna o valor original para tipo desconhecido', () => {
    expect(formatarTipo('outro')).toBe('outro');
  });
});

describe('formatarStatus', () => {
  it('retorna label correto para cada status', () => {
    expect(formatarStatus('disponivel')).toBe('Disponível');
    expect(formatarStatus('ocupado')).toBe('Ocupado');
    expect(formatarStatus('manutencao')).toBe('Manutenção');
    expect(formatarStatus('inativo')).toBe('Inativo');
  });

  it('retorna o valor original para status desconhecido', () => {
    expect(formatarStatus('outro')).toBe('outro');
  });
});
