import cookie from 'js-cookie';
import { ILogin, IFanRegister, IForgot } from 'src/interfaces';
import { APIRequest, TOKEN } from './api-request';

export class AuthService extends APIRequest {
  public async login(data: ILogin) {
    if (data.loginUsername) {
      return this.post('/auth/users/login/username', data);
    }
    return this.post('/auth/users/login/email', data);
  }

  public async loginPerformer(data: ILogin) {
    if (data.loginUsername) {
      return this.post('/auth/performers/login/username', data);
    }
    return this.post('/auth/performers/login/email', data);
  }

  setToken(token: string, role: string): void {
    process.browser && localStorage.setItem(TOKEN, token);
    process.browser && localStorage.setItem('role', role);
    // https://github.com/js-cookie/js-cookie
    // since Safari does not support, need a better solution
    cookie.set(TOKEN, token);
    cookie.set('role', role);
    this.setAuthHeaderToken(token);
  }

  getToken(): string {
    const token = cookie.get(TOKEN);
    if (token) {
      return token;
    }
    return !token && process.browser ? localStorage.getItem(TOKEN) : null;
  }

  getUserRole() {
    const role = cookie.get('role');
    if (role) {
      return role;
    }
    return !role && process.browser ? localStorage.getItem('role') : null;
  }

  removeToken(): void {
    cookie.remove(TOKEN);
    process.browser && localStorage.removeItem(TOKEN);
  }

  updatePassword(password: string, type?: string, source?: string) {
    return this.put('/auth/users/me/password', { type, password, source });
  }

  resetPassword(data: IForgot) {
    return this.post('/auth/users/forgot', data);
  }

  public async register(data: IFanRegister) {
    return this.post('/auth/users/register', data);
  }

  public async registerPerformer(documents: {
    file: File;
    fieldname: string;
  }[], data: any, onProgress?: Function) {
    return this.upload('/auth/performers/register', documents, {
      onProgress,
      customData: data
    });
  }
}

export const authService = new AuthService();
