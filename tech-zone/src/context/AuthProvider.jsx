import { useEffect, useMemo, useState } from "react";
import {
  createUserWithEmailAndPassword,
  onAuthStateChanged,
  signInWithEmailAndPassword,
  signOut,
  updateProfile,
} from "firebase/auth";
import { doc, onSnapshot, serverTimestamp, setDoc } from "firebase/firestore";
import AuthContext from "./AuthContext";
import { auth, db, firebaseConfigured } from "../firebase";

export default function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [authLoading, setAuthLoading] = useState(firebaseConfigured);
  const [authError, setAuthError] = useState("");

  useEffect(() => {
    if (!auth || !db) {
      return undefined;
    }

    let unsubscribeAdmin = () => {};
    const unsubscribeAuth = onAuthStateChanged(auth, (currentUser) => {
      unsubscribeAdmin();
      setUser(currentUser);
      setAuthError("");
      if (!currentUser) {
        setIsAdmin(false);
        setAuthLoading(false);
        return;
      }

      setAuthLoading(true);
      unsubscribeAdmin = onSnapshot(
        doc(db, "admins", currentUser.uid),
        (adminSnapshot) => {
          setIsAdmin(adminSnapshot.exists() && adminSnapshot.data().role === "admin");
          setAuthLoading(false);
        },
        (error) => {
          setIsAdmin(false);
          setAuthError(`Не удалось проверить права администратора: ${error.message}`);
          setAuthLoading(false);
        },
      );
    });
    return () => {
      unsubscribeAuth();
      unsubscribeAdmin();
    };
  }, []);

  async function register({ name, email, password }) {
    if (!auth || !db) throw new Error("Firebase не настроен. Проверьте .env.local.");
    setAuthError("");
    const credential = await createUserWithEmailAndPassword(auth, email, password);
    await updateProfile(credential.user, { displayName: name });
    await setDoc(doc(db, "users", credential.user.uid), {
      uid: credential.user.uid,
      displayName: name,
      email,
      createdAt: serverTimestamp(),
    });
  }

  async function login({ email, password }) {
    if (!auth) throw new Error("Firebase не настроен. Проверьте .env.local.");
    setAuthError("");
    await signInWithEmailAndPassword(auth, email, password);
  }

  async function logout() {
    if (!auth) return;
    await signOut(auth);
  }

  const value = useMemo(
    () => ({
      user,
      isAdmin,
      authLoading,
      authError,
      setAuthError,
      register,
      login,
      logout,
      firebaseConfigured,
    }),
    [user, isAdmin, authLoading, authError],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
