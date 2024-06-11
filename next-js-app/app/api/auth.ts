import { initializeApp, cert, getApps } from "firebase-admin/app";
import { getAuth } from "firebase-admin/auth";
import { getFirestore } from "firebase-admin/firestore";

const serviceAccount = JSON.parse(process.env.FIREBASE_ADMIN_KEY!);

let app;
if (!getApps().filter((app) => app.name === "service").length) {
  app = initializeApp(
    {
      credential: cert(serviceAccount),
    },
    "service"
  );
} else {
  app = getApps().filter((app) => app.name === "service")[0];
}

const auth = getAuth(app);
const organizationdb = getFirestore(app);

export { auth, organizationdb };
