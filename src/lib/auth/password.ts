import bcrypt from 'bcryptjs'

/**
 * Serviço de hash de senhas
 * Usa Bun.password quando disponível, fallback para bcryptjs em testes
 */
export class PasswordService {
  /**
   * Gera hash de uma senha usando bcrypt
   */
  static async hash(password: string): Promise<string> {
    // Use Bun.password if available (runtime), otherwise use bcryptjs (tests)
    if (typeof Bun !== 'undefined' && Bun.password) {
      return await Bun.password.hash(password, {
        algorithm: 'bcrypt',
        cost: 10,
      })
    }

    return await bcrypt.hash(password, 10)
  }

  /**
   * Verifica se uma senha corresponde ao hash
   */
  static async verify(password: string, hash: string): Promise<boolean> {
    // Use Bun.password if available (runtime), otherwise use bcryptjs (tests)
    if (typeof Bun !== 'undefined' && Bun.password) {
      return await Bun.password.verify(password, hash)
    }

    return await bcrypt.compare(password, hash)
  }
}
