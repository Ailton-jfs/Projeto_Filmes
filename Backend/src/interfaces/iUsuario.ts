interface iUsuario {
  id?: number;
  nome: string;
  email: string;
  senha: string;
  preferencias: string;
  createdAt?: Date;
  updatedAt?: Date;
  is_admin?: boolean;
}

export default iUsuario;