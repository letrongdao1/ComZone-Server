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
      apiKey: 'AIzaSyAxTgM3n5I_wT8Us-PLhUPrtq4LuNz8f2M',
      authDomain: 'comzone-69b8f.firebaseapp.com',
      projectId: 'comzone-69b8f',
      storageBucket: 'comzone-69b8f.appspot.com',
      messagingSenderId: '962966654659',
      appId: '1:962966654659:web:6b248b1a3c4551fc0d1c76',
      measurementId: 'G-QEFDJ93EVW',
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
