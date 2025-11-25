import { initializeApp, FirebaseApp } from 'firebase/app';
import { getFirestore, initializeFirestore, persistentLocalCache, persistentMultipleTabManager, Firestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "AIzaSyD0LjFHVgivkF-LlDSsY7G9AWl9GaHJHmA",
  authDomain: "aplicacion-de-contabilid-72e34.firebaseapp.com",
  projectId: "aplicacion-de-contabilid-72e34",
  storageBucket: "aplicacion-de-contabilid-72e34.firebasestorage.app",
  messagingSenderId: "885225740544",
  appId: "1:885225740544:web:d6ca4181b0fe8b43f93be5"
};

let app: FirebaseApp;
let db: Firestore;

try {
    console.log("Initializing Firebase App...");
    app = initializeApp(firebaseConfig);

    console.log("Initializing Firestore with settings...");
    // Usamos initializeFirestore para poder pasar configuraciones críticas como ignorar undefined
    db = initializeFirestore(app, {
        // Esto evita que la app explote si intentas guardar un campo 'undefined'
        ignoreUndefinedProperties: true,
        // Configuración moderna de persistencia (caché local)
        localCache: persistentLocalCache({
            tabManager: persistentMultipleTabManager()
        })
    });
    console.log("Firebase initialized successfully");
} catch (error) {
    console.error("FATAL: Error initializing Firebase:", error);
    // Re-lanzamos el error para que se pueda capturar arriba si es necesario, 
    // pero aseguramos que el módulo no exporte variables undefined silenciosamente.
    throw error;
}

export { db };