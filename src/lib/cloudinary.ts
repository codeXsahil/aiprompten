import { cloudinaryConfig } from './firebase';

export const uploadToCloudinary = async (file: File): Promise<string> => {
  const formData = new FormData();
  formData.append('file', file);
  formData.append('upload_preset', cloudinaryConfig.uploadPreset);

  const response = await fetch(
    `https://api.cloudinary.com/v1_1/${cloudinaryConfig.cloudName}/image/upload`, 
    { method: 'POST', body: formData }
  );

  if (!response.ok) throw new Error('Cloudinary upload failed');
  const data = await response.json();
  return data.secure_url;
};
