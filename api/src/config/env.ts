export function getRequiredEnv(name: string): string {
  const value = process.env[name]?.trim();

  if (!value) {
    throw new Error(`Variável de ambiente obrigatória não configurada: ${name}`);
  }

  return value;
}

export function validateRequiredEnv(names: readonly string[]): void {
  names.forEach(getRequiredEnv);
}