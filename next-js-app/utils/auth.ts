import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";

const auth = getAuth(
  initializeApp(JSON.parse(process.env.NEXT_PUBLIC_FIREBASE_CONFIG!))
);
console.log("auth ", auth);
export { auth };
