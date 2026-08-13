import { Request, Response, NextFunction } from 'express';
import { adminAuth } from '../lib/firebase-admin.ts';
import { DecodedIdToken } from 'firebase-admin/auth';
import { db } from '../db/index.ts';
import { users } from '../db/schema.ts';
import { eq } from 'drizzle-orm';

export interface AuthRequest extends Request {
  user?: DecodedIdToken;
  dbUser?: any;
}

export const requireAuth = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    res.status(401).json({ error: 'Unauthorized: Missing token' });
    return;
  }

  const token = authHeader.split('Bearer ')[1];
  try {
    const decodedToken = await adminAuth.verifyIdToken(token);
    req.user = decodedToken;

    // Fetch db user to get tenantId and role
    let dbUserRecords = await db.select().from(users).where(eq(users.uid, decodedToken.uid));
    
    // If not found by UID, check if there's an ALUNO with this email
    // This allows students created by the Personal to log in via Google
    if (dbUserRecords.length === 0 && decodedToken.email) {
      const dbUserByEmail = await db.select().from(users).where(eq(users.email, decodedToken.email));
      if (dbUserByEmail.length > 0 && dbUserByEmail[0].role === 'ALUNO') {
        // Update the UID to match the real Google Auth UID
        await db.update(users).set({ uid: decodedToken.uid }).where(eq(users.id, dbUserByEmail[0].id));
        dbUserRecords = [ { ...dbUserByEmail[0], uid: decodedToken.uid } ];
      }
    }

    if (dbUserRecords.length > 0) {
      req.dbUser = dbUserRecords[0];
    } else {
      res.status(401).json({ error: 'Unauthorized: User not registered in database' });
      return;
    }

    next();
  } catch (error) {
    console.error('Error verifying Firebase ID token:', error);
    res.status(401).json({ error: 'Unauthorized: Invalid token' });
    return;
  }
};
