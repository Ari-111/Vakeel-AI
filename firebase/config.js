import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';

const firebaseConfig = {
  apiKey: "AIzaSyAfAVes98pr37qHD3FBzI2YX51eKEKtE24",
  authDomain: "vakeelai-92bc4.firebaseapp.com",
  projectId: "vakeelai-92bc4",
  storageBucket: "vakeelai-92bc4.firebasestorage.app",
  messagingSenderId: "223497940484",
  appId: "1:223497940484:web:d29a852eb34820aac20f51"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);