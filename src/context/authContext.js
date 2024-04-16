import { createContext, useEffect, useState } from "react";
import { auth, db } from "../firebase"; //
import { onAuthStateChanged } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore"; //

export const AuthContext = createContext();

export const AuthContextProvider = ({ children }) => {
    const [currentUser, setCurrentUser] = useState(null); // 初始化为null

    useEffect(() => {
        const unsub = onAuthStateChanged(auth, async (user) => {
            if (user) {
                // get currentUser
                const userRef = doc(db, "users", user.uid);
                const docSnap = await getDoc(userRef);
                if (docSnap.exists()) {
                    //set new roles
                    setCurrentUser({
                        ...user,
                        role: docSnap.data().role,
                    });
                    console.log("Update success")
                } else {
                    setCurrentUser(user);
                    console.log("no such roles")
                }
            } else {
                // 用户未登录
                console.log("No login")
                setCurrentUser(null);
            }
        });

        return () => {
            unsub();
        };
    }, []);

    return (
        <AuthContext.Provider value={{ currentUser }}>
            {children}
        </AuthContext.Provider>
    );
};
