
import { initializeApp } from 'firebase/app';
import { getFirestore, enableIndexedDbPersistence } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "AIzaSyD0LjFHVgivkF-LlDSsY7G9AWl9GaHJHmA",
  authDomain: "aplicacion-de-contabilid-72e34.firebaseapp.com",
  projectId: "aplicacion-de-contabilid-72e34",
  storageBucket: "aplicacion-de-contabilid-72e34.firebasestorage.app",
  messagingSenderId: "885225740544",
  appId: "1:885225740544:web:d6ca4181b0fe8b43f93be5"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// Habilitar persistencia offline para mejorar la experiencia con conexiones inestables
enableIndexedDbPersistence(db).catch((err) => {
    if (err.code == 'failed-precondition') {
        console.warn('La persistencia falló: Múltiples pestañas abiertas.');
    } else if (err.code == 'unimplemented') {
        console.warn('La persistencia falló: El navegador no soporta esta característica.');
    }
});

export { db };
