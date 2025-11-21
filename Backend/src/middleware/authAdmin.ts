// src/middleware/authAdmin.ts

import { Request, Response, NextFunction } from 'express';
import jwt, { JwtPayload } from 'jsonwebtoken'; 

interface AdminTokenPayload extends JwtPayload { 
    id: number;
    email: string;
    is_admin: boolean;
}

const JWT_SECRET = process.env.JWT_SECRET || "chave_secreta"; 

const authAdmin = (req: Request, res: Response, next: NextFunction) => {
    const authHeader = req.headers.authorization;
    
    // 1. Verificação inicial do cabeçalho
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({ erro: 'Acesso negado. Token não fornecido ou inválido.' });
    }

    // 2. Extração segura do token
    // Usamos 'let' e verificamos o array resultante.
    const tokenParts = authHeader.split(' ');
    
    // 3. Verifica se o formato é 'Bearer <token>'
    if (tokenParts.length !== 2 || tokenParts[0] !== 'Bearer') {
        return res.status(401).json({ erro: 'Acesso negado. Formato de token inválido.' });
    }

    const token = tokenParts[1] as string; // O token agora está garantidamente definido (tokenParts[1])

    try {
        // 4. O TypeScript está agora satisfeito, pois 'token' é uma string definida.
        const decoded = jwt.verify(token, JWT_SECRET); 
        
        // 5. Verificação de tipo e Admin (a correção anterior)
        if (typeof decoded === 'string' || !decoded) {
            return res.status(401).json({ erro: 'Token inválido ou em formato inesperado.' });
        }
        
        const adminPayload = decoded as AdminTokenPayload;
        
        if (!adminPayload.is_admin) {
            console.warn(`Tentativa de acesso não autorizado por usuário ID: ${adminPayload.id}`);
            return res.status(403).json({ erro: 'Acesso negado. Necessita de privilégios de administrador.' });
        }

        (req as any).adminId = adminPayload.id; 
        
        next();
    } catch (error) {
        console.error("Falha na validação do token:", (error as Error).message);
        return res.status(401).json({ erro: 'Token inválido ou expirado.' });
    }
};

export default authAdmin;