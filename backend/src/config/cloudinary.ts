import { v2 as cloudinary } from 'cloudinary';

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Sube un archivo (Buffer) o un dataURL (base64) a Cloudinary y devuelve la URL https
export function uploadBuffer(buffer: Buffer, folder = 'stylefreds'): Promise<string> {
  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      { folder, resource_type: 'image' },
      (error, result) => {
        if (error || !result) return reject(error || new Error('Subida fallida'));
        resolve(result.secure_url);
      }
    );
    stream.end(buffer);
  });
}

export async function uploadDataUrl(dataUrl: string, folder = 'stylefreds'): Promise<string> {
  const result = await cloudinary.uploader.upload(dataUrl, { folder, resource_type: 'image' });
  return result.secure_url;
}

export default cloudinary;