export const imageConfig = {
  maxUploadSize: 5 * 1024 * 1024, // 5MB
  allowedMimeTypes: ["image/jpeg", "image/jpg", "image/png", "image/webp"],
  compressionQuality: 80,
  sizes: {
    thumbnail: { width: 150, height: 150 },
    medium: { width: 600, height: 600 },
    large: { width: 1200, height: 1200 },
  },
};
