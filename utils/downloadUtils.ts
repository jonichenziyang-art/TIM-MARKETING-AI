export const downloadText = (filename: string, text: string) => {
  const element = document.createElement('a');
  const file = new Blob([text], {type: 'text/plain'});
  element.href = URL.createObjectURL(file);
  element.download = filename;
  document.body.appendChild(element); // Required for this to work in FireFox
  element.click();
  document.body.removeChild(element);
};

export const downloadImage = (filename: string, base64Data: string) => {
  if (base64Data.startsWith('http://') || base64Data.startsWith('https://')) {
    fetch(base64Data)
      .then(res => res.blob())
      .then(blob => {
        const url = URL.createObjectURL(blob);
        const element = document.createElement('a');
        element.href = url;
        element.download = filename;
        element.style.display = 'none';
        document.body.appendChild(element);
        element.click();
        setTimeout(() => {
          document.body.removeChild(element);
          URL.revokeObjectURL(url);
        }, 100);
      })
      .catch(err => {
        console.error("Failed to download remote image via blob, falling back to direct link:", err);
        const element = document.createElement('a');
        element.href = base64Data;
        element.target = "_blank";
        element.download = filename;
        element.style.display = 'none';
        document.body.appendChild(element);
        element.click();
        setTimeout(() => {
          document.body.removeChild(element);
        }, 100);
      });
    return;
  }
  const element = document.createElement('a');
  element.href = base64Data;
  element.download = filename;
  element.style.display = 'none';
  document.body.appendChild(element);
  element.click();
  setTimeout(() => {
    if (element.parentNode) {
      document.body.removeChild(element);
    }
  }, 100);
};

export const processImageForDownload = async (
  base64Data: string, 
  aspectRatio: '1:1' | '16:9' | '9:16' | '4:5' | '4:3' | 'Portrait' | 'Square' | 'Landscape',
  filename: string
) => {
  return new Promise<void>((resolve) => {
    const img = new Image();
    img.crossOrigin = "anonymous";
    
    img.onerror = () => {
      console.warn("Failed to process image via canvas, falling back to direct download.");
      downloadImage(filename, base64Data);
      resolve();
    };

    img.onload = () => {
      try {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          downloadImage(filename, base64Data);
          return resolve();
        }

        let targetWidth = img.width;
        let targetHeight = img.height;
        
        // Calculate target dimensions based on aspect ratio
        let ratio = 1;
        if (aspectRatio === '1:1' || aspectRatio === 'Square') ratio = 1;
        else if (aspectRatio === '16:9' || aspectRatio === 'Landscape') ratio = 16 / 9;
        else if (aspectRatio === '9:16' || aspectRatio === 'Portrait') ratio = 9 / 16;
        else if (aspectRatio === '4:5') ratio = 4 / 5;
        else if (aspectRatio === '4:3') ratio = 4 / 3;

        if (img.width / img.height > ratio) {
          // Source is wider than target ratio
          targetWidth = img.height * ratio;
          targetHeight = img.height;
        } else {
          // Source is taller than target ratio
          targetWidth = img.width;
          targetHeight = img.width / ratio;
        }

        canvas.width = targetWidth;
        canvas.height = targetHeight;

        // Center crop
        const offsetX = (img.width - targetWidth) / 2;
        const offsetY = (img.height - targetHeight) / 2;

        ctx.drawImage(img, offsetX, offsetY, targetWidth, targetHeight, 0, 0, targetWidth, targetHeight);
        
        const link = document.createElement('a');
        link.style.display = 'none';
        link.download = filename;
        link.href = canvas.toDataURL('image/png', 1.0);
        document.body.appendChild(link);
        link.click();
        
        // Cleanup
        setTimeout(() => {
          document.body.removeChild(link);
          resolve();
        }, 100);
      } catch (e) {
        console.error("Canvas processing error:", e);
        downloadImage(filename, base64Data);
        resolve();
      }
    };
    img.src = base64Data;
  });
};
