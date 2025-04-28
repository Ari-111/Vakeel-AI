import { upload } from '../../../lib/cloudinary';
import dbConnect from '../../../lib/mongodb';
import User from '../../../models/User';

export const config = {
  api: {
    bodyParser: false,
  },
};

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    await dbConnect();

    // Handle file upload using multer middleware
    const uploadMiddleware = upload.single('profilePicture');

    uploadMiddleware(req, res, async (err) => {
      if (err) {
        return res.status(400).json({ error: err.message });
      }

      if (!req.file) {
        return res.status(400).json({ error: 'No file uploaded' });
      }

      const { firebaseUid } = req.body;

      // Update user profile with Cloudinary image URL
      const updatedUser = await User.findOneAndUpdate(
        { firebaseUid },
        { profilePicture: req.file.path },
        { new: true }
      );

      if (!updatedUser) {
        return res.status(404).json({ error: 'User not found' });
      }

      res.status(200).json({ profilePicture: updatedUser.profilePicture });
    });
  } catch (error) {
    console.error('Error uploading profile picture:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}