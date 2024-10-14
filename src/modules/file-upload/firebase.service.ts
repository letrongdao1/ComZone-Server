import { Injectable } from '@nestjs/common';
import { FirebaseApp, initializeApp } from 'firebase/app';
import {
  FirebaseStorage,
  getDownloadURL,
  getStorage,
  ref,
  uploadBytes,
} from 'firebase/storage';

@Injectable({})
export class FirebaseService {
  private firebaseApp: FirebaseApp;
  private storage: FirebaseStorage;
  constructor() {
    const firebaseConfig = {
      apiKey: process.env.FIREBASE_API_KEY,
      authDomain: process.env.FIREBASE_AUTH_DOMAIN,
      projectId: process.env.FIREBASE_PROJECT_ID,
      storageBucket: process.env.FIREBASE_STORAGE_BUCKET,
      messagingSenderId: process.env.FIREBASE_MESSAGING_SENDER_ID,
      appId: process.env.FIREBASE_APP_ID,
      measurementId: process.env.FIREBASE_MEASUREMENT_ID,
    };
    this.firebaseApp = initializeApp(firebaseConfig);
    this.storage = getStorage(this.firebaseApp);
  }

  uploadImage = (file: Express.Multer.File, folder: string = 'images') =>
    new Promise((resolve, reject) => {
      if (!file) {
        reject(new Error('Image file is undefined'));
      } else {
        const fileName = Date.now();
        const storageRef = ref(this.storage, `${folder}/${fileName}`);
        if (file.mimetype.includes('image') === false) {
          reject(new Error('File is not an image'));
        }
        uploadBytes(storageRef, file.buffer, { contentType: file.mimetype })
          .then(() => {
            console.log('Image uploaded successfully!');
            return getDownloadURL(storageRef);
          })
          .then((downloadURL) => {
            console.log('Image URL:', downloadURL);
            resolve(downloadURL);
          })
          .catch((error) => {
            reject(error);
          });
      }
    });
}
