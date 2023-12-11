import Navbar from "./components/navbar.tsx";
import {Route, Routes} from "react-router-dom";
import AuthenticationPage from "./pages/Authentication.tsx";

const App = () => {
    return (
        <Routes>
            <Route path="/" element={<Navbar />}>
                <Route path="signin" element={<AuthenticationPage type="sign-in" />} />
                <Route path="signup" element={<AuthenticationPage type="sign-up" />} />
            </Route>
        </Routes>
    )
}

export default App;
