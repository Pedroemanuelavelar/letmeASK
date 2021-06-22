import { createContext, ReactNode, useEffect, useState } from "react";
import { auth, firebase } from "../services/firebase";

type User = {
    id: string;
    name: string;
    avatar: string;
}

type AuthContextType = {
    user: User | undefined;
    signInWithGoogle: () => Promise<void>;
}

type AuthContextProviderProps = {
    children: ReactNode;
}

export const AuthContext = createContext({} as AuthContextType);

export function AuthContextProvider(props: AuthContextProviderProps) {
    const [user, setUser] = useState<User>();

    // Salvando os dados para não mais perder o estado
    useEffect(() => {
        const unsubscribe = auth.onAuthStateChanged(user => {
            if(user) {
                const { displayName, photoURL, uid } = user;

                if(!displayName || !photoURL) {
                    throw new Error('Missing information from Google Account.');
                }

            setUser({
                id: uid,
                name: displayName,
                avatar: photoURL
            })
        }
    }) 

        // descadastra o método a ouvidoria useEfect
        return () => {
            unsubscribe();
        }
    }, [])

    // autenticaçõa do usuáro
    async function signInWithGoogle() {
        // autenticação com o google
        const provider = new firebase.auth.GoogleAuthProvider();

        const result = await auth.signInWithPopup(provider);

            // Pega o nome, foto e user id da pessoa 
        if(result.user) {
            const { displayName, photoURL, uid } = result.user;
    
            if(!displayName || !photoURL) {
                throw new Error('Missing information from Google Account.');
            }

            setUser({
                id: uid,
                name: displayName,
                avatar: photoURL
            })
        }
    }


    return(
        <AuthContext.Provider value={{ user, signInWithGoogle }}>
            {props.children}
        </AuthContext.Provider>
    );
}