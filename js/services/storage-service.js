/**
 * BookNest Storage Service
 * Native file picker uploads with Firebase Storage & DataURL fallback.
 */

const BookNestStorage = {
  maxSizeMB: 5,
  allowedTypes: ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'],

  /**
   * Validate file size and type
   */
  validateFile(file) {
    if (!this.allowedTypes.includes(file.type.toLowerCase())) {
      throw new Error(`Invalid file format: ${file.name}. Allowed formats: JPG, PNG, WEBP.`);
    }
    const fileSizeMB = file.size / (1024 * 1024);
    if (fileSizeMB > this.maxSizeMB) {
      throw new Error(`File is too large (${fileSizeMB.toFixed(1)}MB). Max allowed size is ${this.maxSizeMB}MB.`);
    }
    return true;
  },

  /**
   * Upload single image file (Firebase Storage with base64 fallback)
   */
  async uploadImage(file, pathFolder = 'uploads') {
    this.validateFile(file);

    // Live Firebase Storage upload if available
    if (window.BookNestFirebase && window.BookNestFirebase.isLive && window.BookNestFirebase.storage) {
      try {
        const ext = file.name.split('.').pop();
        const filename = `${Date.now()}_${Math.random().toString(36).substring(2, 8)}.${ext}`;
        const storageRef = window.BookNestFirebase.storage.ref(`${pathFolder}/${filename}`);
        const snapshot = await storageRef.put(file);
        return await snapshot.ref.getDownloadURL();
      } catch (err) {
        console.warn('Firebase Storage direct upload notice, using local file reader fallback:', err.message);
      }
    }

    // Local DataURL Reader Fallback
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => resolve(e.target.result);
      reader.onerror = () => reject(new Error('Failed to read file from device.'));
      reader.readAsDataURL(file);
    });
  },

  /**
   * Upload multiple images
   */
  async uploadMultipleImages(fileList, pathFolder = 'books') {
    const urls = [];
    for (let i = 0; i < fileList.length; i++) {
      const url = await this.uploadImage(fileList[i], pathFolder);
      urls.push(url);
    }
    return urls;
  }
};

window.BookNestStorage = BookNestStorage;
