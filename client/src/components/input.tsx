import {InputHTMLAttributes, useState} from "react";

type InputProps = InputHTMLAttributes<HTMLInputElement> & { icon: string }

const Input = ({icon, ...rest}: InputProps) => {
	const [passwordVisibility, setPasswordVisibility] = useState(false);
	return (
		<div className="relative w-[100%] mb-4">
			<input
				{...rest}
				type={rest.type === "password" && !passwordVisibility ? "password" : "text"}
				className="input-box"
			/>

			<i className={`fi ${icon} input-icon`}></i>
			{
				rest.type === 'password' ?
					<i
						className={`fi ${!passwordVisibility ? 'fi-rr-eye-crossed' : 'fi-rr-eye'} input-icon left-[auto] right-4 cursor-pointer`}
						onClick={() => setPasswordVisibility(currentValue => !currentValue)}
					></i> : ""
			}
		</div>
	)
}

export default Input;
