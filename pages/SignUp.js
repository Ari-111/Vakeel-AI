import Head from "next/head";
import Image from "next/image";
import { Inter } from "next/font/google";
import styles from "@/styles/Login.module.css";
import React, { useEffect, useState } from "react";
import { ReactTyped } from "react-typed";
import { useAuth } from "../context/AuthContext";
import { useRouter } from "next/router";

const inter = Inter({ subsets: ["latin"] });

export default function SignUp() {
  const [mounted, setMounted] = useState(false);
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const { login, signup, googleSignIn, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    try {
      if (isLogin) {
        await login(email, password);
        router.push("/research/chat");
      } else {
        await signup(email, password);
        router.push("/profile-setup");
      }
    } catch (err) {
      setError(err.message);
    }
  };

  const handleGoogleSignIn = async () => {
    try {
      await googleSignIn();
      router.push("/profile-setup");
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <>
      <Head>
        <title>Vakeel AI - Login</title>
        <meta name="description" content="Login to Vakeel AI" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
        <div className={styles.container}>
                <div className={styles.leftSection}>
                        <h1 className={styles.title}>Your AI legal assistant</h1>
                        {mounted && (
                            <div className={styles.typingText}>
                            <ReactTyped
                                strings={[
                                "Ask your queries in simple langauge",
                                "Get instant legal advice",
                                "Analyze legal documents efficiently",
                                "Stay compliant with ease",
                                ]}
                                typeSpeed={40}
                                backSpeed={50}
                                loop
                            />
                            </div>
                        )}
                </div>

                <div className={styles.rightSection}>
                    <div className={styles.loginCard}>
                        <div className={styles.logo}>
                        <Image
                            src="/advocate.png"
                            alt="Vakeel AI Logo"
                            width={120}
                            height={120}
                            priority
                        />
                        </div>
                        <h2 className={styles.subtitle}>
                        {isLogin ? "Log in" : "Sign up"}
                        </h2>
                        <form onSubmit={handleSubmit} className={styles.form}>
                        {error && <div className={styles.error}>{error}</div>}
                        <input
                            type="email"
                            placeholder="Email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className={styles.input}
                            required
                        />
                        <input
                            type="password"
                            placeholder="Password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className={styles.input}
                            required
                        />
                        <div className={styles.buttonContainer}>
                            <button
                            type="submit"
                            className={`${styles.button} ${styles.primaryButton}`}
                            >
                            {isLogin ? "Sign In" : "Create Account"}
                            </button>
                            <button
                                type="button"
                                onClick={() => setIsLogin(!isLogin)}
                                className={`${styles.button} ${styles.secondaryButton}`}
                            >
                            {isLogin
                                ? "Need an account? Sign up"
                                : "Already have an account? Sign in"}
                            </button>
                            <button
                            type="button"
                            onClick={handleGoogleSignIn}
                            className={`${styles.button} ${styles.googleButton}`}
                            >
                            Sign in with Google
                            </button>
                        </div>
                        </form>
                    </div>
                </div>
        </div>
    </>
  )
}