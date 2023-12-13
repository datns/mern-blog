import Input from "../components/input.tsx";
import googleIcon from "../assets/images/google.png";
import {Link} from "react-router-dom";
import PageAnimation from "../common/page-animation.tsx";

type AuthenticationPageProps = {
	type: 'sign-up' | 'sign-in'
}

const AuthenticationPage = ({type}: AuthenticationPageProps) => {
	return (
		<PageAnimation key={type}>
			<section className="h-cover flex items-center justify-center">
				<form className="w-[80%] max-w-[400px]">
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