import { initializeApp, getApps, cert } from 'firebase-admin/app'
import { getFirestore } from 'firebase-admin/firestore'
import { getAuth } from 'firebase-admin/auth'

const serviceAccount = JSON.parse(process.env.FIREBASE_ADMIN_SDK!)

const adminApp =
  getApps().length === 0
    ? initializeApp({
        credential: cert({
          projectId: serviceAccount.project_id,
          clientEmail: serviceAccount.client_email,
          privateKey: serviceAccount.private_key,
        }),
      })
    : getApps()[0]

export const adminDb = getFirestore(adminApp)
export const adminAuth = getAuth(adminApp)
