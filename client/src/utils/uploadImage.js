const MAX_IMAGE_BYTES = 2 * 1024 * 1024;

// Uploads an image to the app's own API and resolves with its URL.
// onProgress (optional) receives an integer percentage while uploading.
export default function uploadImage(file, onProgress) {
  return new Promise((resolve, reject) => {
    if (!file.type || !file.type.startsWith('image/')) {
      reject(new Error('Only image files are allowed!'));
      return;
    }
    if (file.size > MAX_IMAGE_BYTES) {
      reject(new Error('Image must be less than 2 MB!'));
      return;
    }

    const xhr = new XMLHttpRequest();
    xhr.open('POST', '/api/image/upload');
    xhr.setRequestHeader('Content-Type', file.type);

    xhr.upload.onprogress = (e) => {
      if (e.lengthComputable && onProgress) {
        onProgress(Math.round((e.loaded / e.total) * 100));
      }
    };

    xhr.onload = () => {
      let data = null;
      try {
        data = JSON.parse(xhr.responseText);
      } catch {
        // non-JSON response, fall through to generic error
      }
      if (xhr.status >= 200 && xhr.status < 300 && data && data.url) {
        resolve(data.url);
      } else if (xhr.status === 401 || xhr.status === 403) {
        reject(
          new Error('Your session has expired — please sign in again.')
        );
      } else {
        reject(new Error((data && data.message) || 'Image upload failed!'));
      }
    };

    xhr.onerror = () => reject(new Error('Image upload failed!'));

    xhr.send(file);
  });
}
