import React, { createContext, useContext, useState, useEffect } from "react";
import { BarLoader } from "react-spinners";
import { auth } from "../firebase/config";
import { useRouter } from "next/router";
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  signInWithPopup,
  GoogleAuthProvider,
  onAuthStateChanged
} from "firebase/auth";
import styles from '../styles/AuthContext.module.css';

const AuthContext = createContext();
const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));
export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if(firebaseUser){
     
        setUser(firebaseUser);
        
      }else{
        
        setUser(null);
        await sleep(1000);
        router.push('/');
        
      }
      setLoading(false);
     
     
    });

    return () => unsubscribe();
  }, []);


  const signup = (email, password) => {
    return createUserWithEmailAndPassword(auth, email, password);
  };

  const login = (email, password) => {
    return signInWithEmailAndPassword(auth, email, password);
  };

  const logout = (email, password) => {
    return signOut(auth);
  };

  const googleSignIn = () => {
    const provider = new GoogleAuthProvider();
    return signInWithPopup(auth, provider);
  };

  return (
    <AuthContext.Provider value={{ user, login, signup, logout, googleSignIn, loading }}>
      {loading ? 
      <div className={styles.container}>
        <p className={styles.header}>Vakeel AI</p>
        <BarLoader color='black'/>
      </div> : children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  return useContext(AuthContext);
};