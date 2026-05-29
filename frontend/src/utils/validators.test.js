import { describe, it, expect } from 'vitest';
import { validarCpf } from './validators';

describe('validarCpf', () => {
  it('aceita CPFs válidos', () => {
    expect(validarCpf('529.982.247-25')).toBe(true);
    expect(validarCpf('52998224725')).toBe(true);
    expect(validarCpf('111.444.777-35')).toBe(true);
  });

  it('rejeita CPF com todos os dígitos iguais', () => {
    expect(validarCpf('111.111.111-11')).toBe(false);
    expect(validarCpf('000.000.000-00')).toBe(false);
    expect(validarCpf('99999999999')).toBe(false);
  });

  it('rejeita CPF com menos de 11 dígitos', () => {
    expect(validarCpf('1234567890')).toBe(false);
    expect(validarCpf('123')).toBe(false);
  });

  it('rejeita CPF com dígito verificador errado', () => {
    expect(validarCpf('529.982.247-26')).toBe(false);
    expect(validarCpf('529.982.247-00')).toBe(false);
  });

  it('rejeita CPF vazio ou somente letras', () => {
    expect(validarCpf('')).toBe(false);
    expect(validarCpf('abcdefghijk')).toBe(false);
  });

  it('ignora pontos e traço na validação', () => {
    expect(validarCpf('529.982.247-25')).toBe(true);
    expect(validarCpf('529982247  25')).toBe(true);
  });
});
