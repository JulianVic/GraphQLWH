import { hash, compare } from 'bcryptjs'

const encryptPassword = async (password: string) => {

  const passwordHash = await hash(password, 10);
  return passwordHash;

}

const verifyPassword = (password: string, hash: string) => {

  const isPasswordValid = compare(password, hash);
  return isPasswordValid;

}

export default { encryptPassword, verifyPassword };
