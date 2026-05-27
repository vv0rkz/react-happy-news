import { db } from '../db/schema'
import { createAuthService } from './authService'

export const authService = createAuthService(db)
