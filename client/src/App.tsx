import Navbar from "./components/navbar.tsx";
import {Route, Routes} from "react-router-dom";
import AuthenticationPage from "./pages/Authentication.tsx";
import {createContext, useEffect, useState} from "react";
import {lookInSession} from "./common/session.ts";
import {UserAuth, UserAuthContext} from "./types.ts";
import EditorPage from "./pages/Editor.tsx";
import {Toaster} from "react-hot-toast";
import HomePage from "./pages/Home.tsx";
import SearchPage from "./pages/Search.tsx";
import NotFoundPage from "./pages/NotFound.tsx";
import ProfilePage from "./pages/Profile.tsx";
import BlogPage from "./pages/Blog.tsx";

export const UserContext = createContext<UserAuthContext | null>(null)

const App = () => {
	const [userAuth, setUserAuth] = useState<UserAuth>();

	useEffect(() => {
		const userInSession = lookInSession("user");

		if (userInSession) {
			setUserAuth(JSON.parse(userInSession))
		} else {
			setUserAuth({access_token: null})
		}
	}, []);

	return (

		<UserContext.Provider value={{userAuth, setUserAuth}}>
			<Toaster />
			<Routes>
				<Route path="/editor" element={<EditorPage/>}/>
				<Route path="/editor/:blog_id" element={<EditorPage/>}/>
				<Route path="/" element={<Navbar/>}>
					<Route index element={<HomePage/>} />
					<Route path="signin" element={<AuthenticationPage type="sign-in"/>}/>
					<Route path="signup" element={<AuthenticationPage type="sign-up"/>}/>
					<Route path="search/:query" element={<SearchPage />}/>
					<Route path="user/:id" element={<ProfilePage />}/>
					<Route path="blog/:blog_id" element={<BlogPage />}/>
					<Route path='*' element={<NotFoundPage />} />
				</Route>
			</Routes>
		</UserContext.Provider>

	)
}

export default App;
