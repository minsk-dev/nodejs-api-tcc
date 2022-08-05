import { prismaClient } from '../../../database/prismaClient.js';
import { comparePassword } from '../utils/decrypt.js';
import { generateToken } from '../utils/generateToken.js';

export class AuthController {
    async authenticate(request, response) {
        const {email, password} = request.body;
        const user = await prismaClient.user.findUnique({
            where: {
              email: email
            },
          })
        
        if (!user) {
            return response.status(401).json({message:"Usuário ou senha incorreta!"})
        }

        if (!user.active_account) {
            return response.status(403).json({message:"Usuário desativado"})
        }

        const validatePassword = await comparePassword(password, user.password);
        
        if (!validatePassword) {
            return response.status(401).json({message:"Usuário ou senha incorreta!"})
        }

        delete user.password;

        const token = await generateToken(user);
        
        return response.status(200).json({
              message: "Usuário autenticado",
              user,
              token
          })
    }
}