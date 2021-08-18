export interface ILogin {
  username?: string;
  loginUsername?: boolean;
  email?: string;
  password: string;
  loginAs: string;
}

export interface IForgot {
  email: string;
  type?: string;
}

export interface IFanRegister {
  name?: string;
  firstName: string;
  lastName: string;
  username: string;
  gender: string;
  email: string;
  password: string;
}

export interface IPerformerRegister {
  firstName: string;
  lastName: string;
  name?: string;
  username: string;
  email: string;
  password: string;
  gender: string;
}
