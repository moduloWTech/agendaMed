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
\nexport interface IAcceptInviteData {\n  token: string;\n  name: string;\n  email: string;\n  phoneWhats: string;\n  password: string;\n}
