
import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";


const firebaseConfig = {
  apiKey: "AIzaSyB6dVJpNkvLxHfy8g78ejJOT1YF3VjK6Y4",
  authDomain: "authexamnotes-384f7.firebaseapp.com",
  projectId: "authexamnotes-384f7",
  storageBucket: "authexamnotes-384f7.firebasestorage.app",
  messagingSenderId: "76558669263",
  appId: "1:76558669263:web:21f0bd91e68f536e912eba"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

const auth = getAuth(app);

const provider = new GoogleAuthProvider();

provider.setCustomParameters({
  prompt: "select_account",
});

export { auth, provider };