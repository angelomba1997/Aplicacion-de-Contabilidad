
import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';

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

// La persistencia offline se ha deshabilitado para evitar errores de "future update time"
// y problemas de caché en entornos de desarrollo web.
// Si se necesita en producción, descomentar con precaución y manejar la sincronización de reloj.

export { db };
