import { useState, useEffect, useRef } from 'react';
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
  const [selectedImage, setSelectedImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const fileInputRef = useRef(null);
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



  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setSelectedImage(file);
      setImagePreview(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      // First, upload the profile picture if selected
      let profilePictureUrl = '';
      if (selectedImage) {
        const imageFormData = new FormData();
        imageFormData.append('profilePicture', selectedImage);
        imageFormData.append('firebaseUid', user.uid);

        const imageResponse = await fetch('/api/users/upload-profile-picture', {
          method: 'POST',
          body: imageFormData,
        });

        if (!imageResponse.ok) {
          throw new Error('Failed to upload profile picture');
        }

        const imageData = await imageResponse.json();
        profilePictureUrl = imageData.profilePicture;
      }

      const formDataToSend = {
        username: formData.username,
        dateOfBirth: formData.dateOfBirth,
        firebaseUid: user.uid,
        profilePicture: profilePictureUrl
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
                src={imagePreview || "/advocate.png"}
                alt="Profile Picture"
                width={120}
                height={120}
                priority
                className={styles.profileImage}
                onClick={() => fileInputRef.current?.click()}
                style={{ cursor: 'pointer', borderRadius: '50%' }}
              />
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleImageChange}
                accept="image/*"
                style={{ display: 'none' }}
              />
              <p className={styles.uploadText}>Click to upload profile picture</p>
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