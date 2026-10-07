import * as bcrypt from 'bcryptjs';
import { AuthRepository } from '../repository/auth.repository';
import { LoginRequest, RegisterRequest, AuthResponse } from '@/backend/types/api.types';

export class AuthService {
  private authRepository: AuthRepository;

  constructor() {
    this.authRepository = new AuthRepository();
  }

  async login(credentials: LoginRequest): Promise<AuthResponse> {
    const user = await this.authRepository.findUserByEmail(credentials.email);
    
    if (!user) {
      throw new Error('Invalid credentials');
    }

    const isPasswordValid = await bcrypt.compare(credentials.password, user.password);
    
    if (!isPasswordValid) {
      throw new Error('Invalid credentials');
    }

    return {
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    };
  }

  async register(userData: RegisterRequest): Promise<AuthResponse> {
    const existingUser = await this.authRepository.findUserByEmail(userData.email);
    
    if (existingUser) {
      throw new Error('User already exists');
    }

    const hashedPassword = await bcrypt.hash(userData.password, 10);

    const newUser = await this.authRepository.createUser({
      ...userData,
      password: hashedPassword,
    });

    if (!newUser) {
      throw new Error('Failed to create user');
    }

    return {
      user: {
        id: newUser.id,
        name: newUser.name,
        email: newUser.email,
        role: newUser.role,
      },
    };
  }
}
