import {firebaseConfig} from './firebase-config.js';
export const firebaseReady=Promise.all([
 import('https://www.gstatic.com/firebasejs/12.19.0/firebase-app.js'),
 import('https://www.gstatic.com/firebasejs/12.19.0/firebase-auth.js'),
 import('https://www.gstatic.com/firebasejs/12.19.0/firebase-firestore.js')
]).then(([apps,authSdk,storeSdk])=>{const app=apps.initializeApp(firebaseConfig);return {auth:authSdk.getAuth(app),authSdk,storeSdk,db:storeSdk.getFirestore(app)};});
