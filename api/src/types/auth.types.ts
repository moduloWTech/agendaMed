export interface IRegisterData {
  name: string;
  email: string;
  phoneWhats: string;
  password?: string;
}

export interface ILoginData {
  email: string;
  password?: string;
}
