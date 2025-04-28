import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Image from 'next/image';
import { useAuth } from '../context/AuthContext';
import styles from '../styles/Login.module.css';
import { ReactTyped } from "react-typed";

export default function ProfileSetup() {
  const router = useRouter();
  const { user } = useAuth();
  const [formData, setFormData] = useState({
    username: '',
    dateOfBirth: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!user) {
      router.push('/SignUp');
    }
  }, [user, router]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };



  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const formDataToSend = {
        username: formData.username,
        dateOfBirth: formData.dateOfBirth,
        firebaseUid: user.uid
      };

      const response = await fetch('/api/users/profile', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formDataToSend),
      });

      if (!response.ok) {
        throw new Error('Failed to save profile');
      }

      router.push('/research/chat'); // Redirect to chat interface after successful setup
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (!user) return null;

  return (
    <div className={styles.container}>
      <div className={styles.leftSection}>
        <h1 className={styles.title}>Vakeel AI</h1>
        <div className={styles.typingText}>
          <ReactTyped
            strings={[
              "Complete your profile",
              "Join our legal community",
              "Get personalized assistance",
              "Access legal resources"
            ]}
            typeSpeed={40}
            backSpeed={50}
            loop
          />
        </div>
      </div>
      <div className={styles.rightSection}>
        <div className={styles.loginCard}>
          <div className={styles.cardHeader}>
            <div className={styles.logo}>
              <Image
                src="/advocate.png"
                alt="Advocate"
                width={120}
                height={120}
                priority
              />
            </div>
            <h2>Complete Your Profile</h2>
          </div>
          {error && <p className={styles.error}>{error}</p>}
          <form onSubmit={handleSubmit} className={styles.form}>
            <div className={styles.inputGroup}>
              <input
                type="text"
                id="username"
                name="username"
                value={formData.username}
                onChange={handleInputChange}
                required
                minLength={3}
                maxLength={30}
                placeholder="Username"
                className={styles.input}
              />
            </div>


            <div className={styles.inputGroup}>
              <input
                type="date"
                id="dateOfBirth"
                name="dateOfBirth"
                value={formData.dateOfBirth}
                onChange={handleInputChange}
                required
                className={styles.input}
              />
            </div>

            <button
              type="submit"
              className={styles.button}
              disabled={loading}
            >
              {loading ? 'Saving...' : 'Continue to Chat'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}