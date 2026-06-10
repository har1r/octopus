// src/services/auth.service.ts
import { UserRepository } from '@/repositories/user.repository';
import { User } from '@prisma/client';
import { Result } from '@/types/result';
import bcrypt from 'bcrypt';

export class AuthService {
  static async validateUser(username: string, passwordPlain: string): Promise<Result<User>> {
    try {
      const user = await UserRepository.findByUsername(username);
      if (!user) {
        return { success: false, error: 'User tidak ditemukan' };
      }

      if (!user.isActive) {
        return { success: false, error: 'User tidak aktif' };
      }

      const passwordMatch = await bcrypt.compare(passwordPlain, user.passwordHash);
      if (!passwordMatch) {
        return { success: false, error: 'Password salah' };
      }

      return { success: true, data: user };
    } catch (error: any) {
      return { success: false, error: error.message || 'Error autentikasi' };
    }
  }
}
