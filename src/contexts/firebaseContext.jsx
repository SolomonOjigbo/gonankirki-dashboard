"use client";

import { createContext, useEffect, useReducer, useCallback } from "react";
import { initializeApp } from "firebase/app";
import {
  getAuth,
  signOut,
  signInWithPopup,
  GoogleAuthProvider,
  onAuthStateChanged,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  sendSignInLinkToEmail
} from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { SplashScreen } from "components/splash-screen";

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
  measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);
const actionCodeSettings = {
  // URL you want to redirect back to. The domain (www.example.com) for this
  // URL must be in the authorized domains list in the Firebase Console.
  url: 'https://gonankirki-v2.firebaseapp.com/',
  // This must be true. 
  handleCodeInApp: true,
};

const initialAuthState = {
  user: null,
  isInitialized: false,
  isAuthenticated: false
};

const reducer = (state, action) => {
  switch (action.type) {
    case "AUTH_STATE_CHANGED":
      const { isAuthenticated, user } = action.payload;
      return {
        ...state,
        isAuthenticated,
        user,
        isInitialized: true
      };
    default:
      return state;
  }
};

const signInWithEmail = async(email, password) => {
   signInWithEmailAndPassword(auth, email, password).then((userCredential) => {
    // Signed in 
    const user = userCredential.user;
    alert(`User ${user.displayName} signed in successfully`);
  })
  .catch((error) => {
    const errorCode = error.code;
    const errorMessage = error.message;
  });
};

const signInWithGoogle = async() => {
  const provider = new GoogleAuthProvider();
  signInWithPopup(auth, provider).then((result) => {
    const credentials =  GoogleAuthProvider.credentialFromResult(result);
    const token = credentials.accessToken;
    // The signed-in user info.
    const credential = GoogleAuthProvider.credential(null, token);
     signInWithCredential(auth, credential);
    const user = auth.currentUser
    if (user) {
      const userDocRef = doc(db, 'users', user.uid);
      const userDoc = getDoc(userDocRef);

      if (!userDoc.exists()) {
        // If user document does not exist, create it
        setDoc(userDocRef, {
          id: user.uid,
          email: user.email,
          displayName: user.displayName,
          photoURL: user.photoURL
        });
        alert('User record created successfully');
      } else {
        alert('User signed in successfully');
      }
    }
  }).catch((error) => {
    // Handle Errors here.
    const errorCode = error.code;
    const errorMessage = error.message;
    console.log(`${errorCode}, ${errorMessage}`)
  });
};

const createUserWithEmail = async(email, password) => {
  await createUserWithEmailAndPassword(auth, email, password).then((userCredential) => {
    // Signed in 
    const user = userCredential.user;
       if(!user){
        alert('Please enter your email and password');
        return
       }
       if (user) {
        const userDocRef = doc(db, 'users', user.uid);
        const userDoc = getDoc(userDocRef);
  
        if (!userDoc.exists()) {
          // If user document does not exist, create it
          setDoc(userDocRef, {
            id: user.uid,
            email: user.email,
            // displayName: user.displayName,
            // photoURL: user.photoURL
          });
          alert('User record created successfully');
        } else {
          alert('User with email already exists');
        }
      }
    }).catch((error) => {
      // Handle Errors here.
      const errorCode = error.code;
      const errorMessage = error.message;
      alert(`${errorCode}, ${errorMessage}`)
    });
};

const signInWithEmailLink = (email) => {
      sendSignInLinkToEmail(auth, email, actionCodeSettings)
  .then(() => {
    // The link was successfully sent. Inform the user.
    // Save the email locally so you don't need to ask the user for it again
    // if they open the link on the same device.
    window.localStorage.setItem('emailForSignIn', email);
    navigate("/login")
  })
  .catch((error) => {
    const errorCode = error.code;
    const errorMessage = error.message;
    // ...
  });
}

const logout = () => signOut(auth);

export const AuthContext = createContext({
  ...initialAuthState,
  method: "FIREBASE",
  logout,
  signInWithGoogle,
  signInWithEmail,
  createUserWithEmail,
  signInWithEmailLink,
  db // Include db in the context value
});

export const AuthProvider = ({ children }) => {
  const [state, dispatch] = useReducer(reducer, initialAuthState);

  const init = useCallback(() => {
    onAuthStateChanged(auth, (user) => {
      if (user) {
        const payload = {
          isAuthenticated: true,
          user: {
            id: user.uid,
            role: "admin",
            email: user.email,
            avatar: user.photoURL,
            name: user.displayName || user.email
          }
        };
        dispatch({
          type: "AUTH_STATE_CHANGED",
          payload
        });
      } else {
        dispatch({
          type: "AUTH_STATE_CHANGED",
          payload: {
            isAuthenticated: false,
            user: null
          }
        });
      }
    });
  }, []);

  useEffect(() => init(), [init]);

  if (!state.isInitialized) return <SplashScreen />;

  return (
    <AuthContext.Provider value={{
      ...state,
      logout,
      signInWithEmail,
      signInWithGoogle,
      method: "FIREBASE",
      createUserWithEmail,
      signInWithEmailLink,
      db // Include db in the context value
    }}>
      {children}
    </AuthContext.Provider>
  );
};
