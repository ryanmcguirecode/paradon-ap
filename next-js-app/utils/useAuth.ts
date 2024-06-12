// import { useEffect, useState } from "react";
// import { useRouter } from "next/navigation";
// import { onAuthStateChanged } from "firebase/auth";
// import { auth } from "./auth";

// const useAuth = () => {
//   const [loading, setLoading] = useState(true);
//   const [authenticated, setAuthenticated] = useState(false);
//   const router = useRouter();

//   useEffect(() => {
//     const unsubscribe = onAuthStateChanged(auth, (user) => {
//       if (user) {
//         setAuthenticated(true);
//       } else {
//         router.push("/");
//       }
//       setLoading(false);
//     });

//     return () => unsubscribe();
//   }, [router]);

//   return { loading, authenticated };
// };

// export default useAuth;
