// import 'dotenv/config'
import { initializeApp } from 'firebase/app'
import { getFirestore } from 'firebase/firestore'
import { getAuth } from 'firebase/auth'

const firebaseConfig = {
  apiKey: import.meta.env.VITE_API_KEY,
  authDomain: import.meta.env.VITE_VITE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_VITE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_VITE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_VITE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_VITE_API_ID,
}

const firebaseApp = initializeApp(firebaseConfig)
const db = getFirestore(firebaseApp)
const auth = getAuth(firebaseApp)

export { db, auth }
