export interface IRegisterData {
  name: string;
  email: string;
  phoneWhats: string;
  password?: string;
}

export interface ILoginData {
  email: string;
}
export interface IAcceptInviteData {
  token: string;
  name: string;
  email: string;
  phoneWhats: string;
  password: string;
}
