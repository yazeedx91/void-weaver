/**
 * Evidence Upload Utility
 * Strips EXIF metadata for location protection
 */

export async function stripExifMetadata(file: File): Promise<Blob> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    
    reader.onload = (e) => {
      const img = new Image();
      
      img.onload = () => {
        // Create canvas and redraw image (removes EXIF)
        const canvas = document.createElement('canvas');
        canvas.width = img.width;
        canvas.height = img.height;
        
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          reject(new Error('Canvas context not available'));
          return;
        }
        
        ctx.drawImage(img, 0, 0);
        
        // Convert to blob without metadata
        canvas.toBlob((blob) => {
          if (blob) {
            resolve(blob);
          } else {
            reject(new Error('Failed to create blob'));
          }
        }, file.type || 'image/jpeg', 0.9);
      };
      
      img.onerror = () => reject(new Error('Failed to load image'));
      img.src = e.target?.result as string;
    };
    
    reader.onerror = () => reject(new Error('Failed to read file'));
    reader.readAsDataURL(file);
  });
}

export async function uploadEvidence(file: File, userId: string): Promise<string> {
  // Strip EXIF if it's an image
  let fileToUpload = file;
  
  if (file.type.startsWith('image/')) {
    const strippedBlob = await stripExifMetadata(file);
    fileToUpload = new File([strippedBlob], file.name, { type: file.type });
  }
  
  // Convert to base64 for encryption
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    
    reader.onload = () => {
      const base64 = reader.result as string;
      resolve(base64);
    };
    
    reader.onerror = () => reject(new Error('Failed to read file'));
    reader.readAsDataURL(fileToUpload);
  });
}
