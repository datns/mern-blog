import {Link, useNavigate} from "react-router-dom";
import {toast, Toaster} from "react-hot-toast";
import axios from "axios";
import Input from "../components/input.tsx";
import googleIcon from "../assets/images/google.png";
import PageAnimation from "../common/page-animation.tsx";
import {FormEvent, useContext, useEffect, useRef} from "react";
import {validateEmail, validatePassword} from "../utils/validation.ts";
import {storeInSession} from "../common/session.ts";
import {UserContext} from "../App.tsx";
import {UserAuth, UserAuthContext} from "../types.ts";

type AuthenticationPageProps = {
	type: 'sign-up' | 'sign-in'
}

const AuthenticationPage = ({type}: AuthenticationPageProps) => {
	const formRef = useRef(null);
	const { userAuth, setUserAuth } = useContext(UserContext) as UserAuthContext

	const navigate = useNavigate();

	useEffect(() => {
			if (userAuth?.access_token){
				navigate("/")
			}
	}, [userAuth?.access_token])

	const onSignInOrSignUp = async (formData: Record<string, unknown>) => {
		try {
			const result: { data: UserAuth } = await axios.post(`${import.meta.env.VITE_SERVER_DOMAIN}/${type.replace("-", "")}`, formData)

			if (result) {
				storeInSession("user", JSON.stringify(result.data))
				setUserAuth(result.data);
			}
		} catch (e) {
			console.log(e);
			// eslint-disable-next-line @typescript-eslint/ban-ts-comment
			// @ts-expect-error
			toast.error(e?.data?.error)
		}
	}

	const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
		e.preventDefault();

		const form = new FormData(formRef?.current || undefined);
		const formData: { fullname: string; email: string; password: string } = {fullname: '', email: '', password: ''};

		for (const [key, value] of form.entries()) {
			Object.assign(formData, {[key]: value})
		}


		const {fullname, email, password} = formData;

		if (fullname.length > 0)
			if (fullname.length < 3) {
				return toast.error("Full name must be at least 3 letters long");
			}

		if (!email.length) {
			return toast.error("Enter email")
		}

		if (!validateEmail(email)) {
			return toast.error("Email is invalid ")
		}

		if (!validatePassword(password)) {
			return toast.error("Password should be 6 to 20 characters long with a numeric, 1 lowercase and 1 uppercase letters")
		}

		await onSignInOrSignUp(formData)

	}


	return (
		<PageAnimation key={type}>
			<Toaster/>
			<section className="h-cover flex items-center justify-center">
				<form id={"form"} ref={formRef} className="w-[80%] max-w-[400px]" onSubmit={handleSubmit}>
					<h1 className="text-4xl font-gelasio capitalize text-center mb-24">
						{type === "sign-in" ? "Welcome back" : "Join us today"}
					</h1>

					{
						type === "sign-up" ?
							<Input
								name="fullname"
								type="text"
								placeholder="Full Name"
								icon="fi-rr-user"
							/> : ""
					}

					<Input
						name="email"
						type="email"
						placeholder="Email"
						icon="fi-rr-envelope"
					/>
					<Input
						name="password"
						type="password"
						placeholder="Password"
						icon="fi-rr-key"
					/>
					<button
						className="btn-dark center mt-14"
						type="submit"
					>
						{
							type.replace("-", " ")
						}
					</button>

					<div className="relative w-full flex items-center gap-2 my-10 uppercase text-black font-bold">
						<hr className="w-1/2 border-black"/>
						<p>or</p>
						<hr className="w-1/2 border-black"/>
					</div>
					<button
						className="btn-dark flex items-center justify-center gap-4 w-[90%] center"
					>
						<img src={googleIcon} className="w-5"/>
						Continue with google
					</button>
					{
						type === 'sign-in' ?
							<p className="mt-6 text-dark-grey text-xl text-center">
								Don't have an account?
								<Link to="/signup" className="underline text-black text-xl ml-1">
									Join us today
								</Link>
							</p>
							:
							<p className="mt-6 text-dark-grey text-xl text-center">
								Already a member?
								<Link to="/signin" className="underline text-black text-xl ml-1">
									Sign in here
								</Link>
							</p>
					}
				</form>
			</section>
		</PageAnimation>

	)
}

export default AuthenticationPage;
