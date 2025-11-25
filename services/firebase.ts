
import { initializeApp } from 'firebase/app';
import { getFirestore, initializeFirestore, persistentLocalCache, persistentMultipleTabManager } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "AIzaSyD0LjFHVgivkF-LlDSsY7G9AWl9GaHJHmA",
  authDomain: "aplicacion-de-contabilid-72e34.firebaseapp.com",
  projectId: "aplicacion-de-contabilid-72e34",
  storageBucket: "aplicacion-de-contabilid-72e34.firebasestorage.app",
  messagingSenderId: "885225740544",
  appId: "1:885225740544:web:d6ca4181b0fe8b43f93be5"
};

console.log("Initializing Firebase App...");
const app = initializeApp(firebaseConfig);

console.log("Initializing Firestore with settings...");
// Usamos initializeFirestore para poder pasar configuraciones críticas como ignorar undefined
const db = initializeFirestore(app, {
    // Esto evita que la app explote si intentas guardar un campo 'undefined'
    ignoreUndefinedProperties: true,
    // Configuración moderna de persistencia (caché local)
    localCache: persistentLocalCache({
        tabManager: persistentMultipleTabManager()
    })
});

export { db };