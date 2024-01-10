import PageAnimation from "../common/page-animation.tsx";
import Input from "../components/input.tsx";
import {useContext, useRef} from "react";
import {toast} from "react-hot-toast";
import {validatePassword} from "../utils/validation.ts";
import axios from "axios";
import {UserContext} from "../App.tsx";

const ChangePasswordPage = () => {
	const formRef = useRef<HTMLFormElement>(null);
	const userContext = useContext(UserContext);

	const handleSubmit = async (e: React.MouseEvent<HTMLButtonElement> & {
		target: HTMLElement
	}) => {
		try {
			e.preventDefault();

			if (formRef.current) {
				const form = new FormData(formRef.current);
				const formData: Record<string, string> = {};

				for (let [key, value] of form.entries()) {
					formData[key] = value.toString();
				}

				const {currentPassword, newPassword} = formData;

				if (!currentPassword.length || !newPassword.length) {
					return toast.error("Fill all the inputs")
				}

				if (!validatePassword(currentPassword) || !validatePassword(newPassword)) {
					return toast.error("Password should be 6 to 20 characters long with a numeric, 1 lowercase and 1 uppercase letters")
				}
				e.target.setAttribute("disabled", "true");
				const loadingToast = toast.loading("Updating...");

				const result = await axios.post(import.meta.env.VITE_SERVER_DOMAIN + '/change-password', formData, {
					headers: {
						'Authorization': `Bearer ${userContext?.userAuth?.access_token}`
					}
				})

				if (result) {
					toast.dismiss(loadingToast);
					e.target.removeAttribute("disabled")
					return toast.success("Password Updated")
				}
			}
		} catch (err) {
			toast.dismiss();
			e.target.removeAttribute("disabled")
			toast.error(String(err));
		}

	}

	return (
		<PageAnimation>
			<form ref={formRef}>
				<h1 className="max-md:hidden">Change Password</h1>

				<div className="py-10 w-full md:max-w-[400px]">
					<Input
						icon="fi-rr-unlock"
						name="currentPassword"
						type="password"
						className="profile-edit-input"
						placeholder="Current Password"
					/>

					<Input
						icon="fi-rr-unlock"
						name="newPassword"
						type="password"
						className="profile-edit-input"
						placeholder="New Password"
					/>
					<button className="btn-dark px-10" type="submit"
							onClick={handleSubmit}>Change Password
					</button>
				</div>
			</form>
		</PageAnimation>
	)
}

export default ChangePasswordPage;
