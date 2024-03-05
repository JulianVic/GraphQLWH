import jwt from 'jsonwebtoken'

const verifyToken = (token: string): any => {

  return jwt.verify(token, process.env.SECRET_KEY || 'clave')

}

const sign = (payload: any, expiresIn: string): string => {

  return jwt.sign({ data: payload }, `${process.env.SECRET_KEY || 'clave'}`, { expiresIn: expiresIn })

}

export default { verifyToken, sign }
