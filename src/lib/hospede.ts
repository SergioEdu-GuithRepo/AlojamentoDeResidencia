/**
 * Guarda (apenas nesta sessão do browser) o email usado para aceder a uma reserva,
 * para que o hóspede não tenha de o reescrever ao navegar no portal.
 */
const chave = (codigo: string) => `mrc_hospede_${codigo.trim().toUpperCase()}`;

export function lembrarEmailReserva(codigo: string, email: string): void {
  try {
    sessionStorage.setItem(chave(codigo), email.trim().toLowerCase());
  } catch {
    /* sessionStorage indisponível (modo privado) — ignora */
  }
}

export function emailGuardadoReserva(codigo: string): string {
  try {
    return sessionStorage.getItem(chave(codigo)) || '';
  } catch {
    return '';
  }
}

export function esquecerEmailReserva(codigo: string): void {
  try {
    sessionStorage.removeItem(chave(codigo));
  } catch {
    /* ignora */
  }
}
