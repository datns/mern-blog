import Navbar from "./components/navbar.tsx";
import {Route, Routes} from "react-router-dom";
import AuthenticationPage from "./pages/Authentication.tsx";
import {createContext, useEffect, useState} from "react";
import {lookInSession} from "./common/session.ts";
import {UserAuth, UserAuthContext} from "./types.ts";

export const UserContext = createContext<UserAuthContext | null>(null)

const App = () => {
    const [userAuth, setUserAuth] = useState<UserAuth>();

    useEffect(() => {
        const userInSession = lookInSession("user");

        if (userInSession) {
            setUserAuth(JSON.parse(userInSession))
        } else {
            setUserAuth({ access_token: null })
        }
    }, []);

    return (

        <UserContext.Provider value={{ userAuth, setUserAuth }}>
            <Routes>
            <Route path="/" element={<Navbar />}>
                <Route path="signin" element={<AuthenticationPage type="sign-in" />} />
                <Route path="signup" element={<AuthenticationPage type="sign-up" />} />
            </Route>
            </Routes>
        </UserContext.Provider>

    )
}

export default App;
