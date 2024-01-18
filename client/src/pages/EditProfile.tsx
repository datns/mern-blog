import React, {useContext, useEffect, useRef, useState} from "react";
import {UserContext} from "../App.tsx";
import axios from "axios";
import {User} from "../types.ts";
import PageAnimation from "../common/page-animation.tsx";
import Loader from "../components/loader.tsx";
import Input from "../components/input.tsx";
import {toast} from "react-hot-toast";
import uploadImage from "../common/uploadImage.ts";
import {storeInSession} from "../common/session.ts";

const bioLimit = 150;
const EditProfilePage = () => {
	const userContext = useContext(UserContext);
	const [profile, setProfile] = useState<User | null>(null);
	const [loading, setLoading] = useState(true);
	const [charactersLeft, setCharactersLeft] = useState(bioLimit);
	const profileImageRef = useRef<HTMLImageElement>(null);
	const [updatedProfileImage, setUpdatedProfileImage] = useState<File | null>(null);
	const editProfileForm = useRef<HTMLFormElement>(null)
	useEffect(() => {
		async function getProfile() {
			try {
				if (userContext?.userAuth?.access_token) {
					const result: {
						data: User
					} = await axios.get(import.meta.env.VITE_SERVER_DOMAIN + "/get-profile", {
						params: {
							username: userContext.userAuth.username
						}
					})

					if (result) {
						setProfile(result.data)
					}
				}
			} catch (err) {
				console.log(err);
			} finally {
				setLoading(false);
			}
		}

		getProfile();

	}, [userContext?.userAuth?.access_token]);

	const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
		setCharactersLeft(bioLimit - e.target.value.length);
	}

	const handleImagePreview = (e: React.ChangeEvent<HTMLInputElement>) => {
		const img = e.target.files![0];

		if (profileImageRef?.current) {
			profileImageRef.current.src = URL.createObjectURL(img);
			setUpdatedProfileImage(img);
		}
	}

	const handleImageUpload = async (e: React.MouseEvent<HTMLButtonElement> & {
		target: HTMLElement
	}) => {
		try {
			e.preventDefault();

			if (updatedProfileImage) {
				toast.loading("Uploading...")
				e.target.setAttribute("disabled", "true");
				const result: {
					data: { url: string }
				} = await uploadImage(updatedProfileImage);
				console.log('result', result);
				if (result.data.url) {
					const updatedResult: {
						data: {
							profile_img: string
						}
					} = await axios.post(import.meta.env.VITE_SERVER_DOMAIN + '/update-profile-img', {url: result.data.url}, {
						headers: {
							'Authorization': `Bearer ${userContext?.userAuth?.access_token}`
						}
					})

					if (updatedResult.data.profile_img) {
						if (userContext?.userAuth?.access_token) {
							const newUserAuth = {
								...userContext?.userAuth,
								profile_img: updatedResult.data.profile_img
							}

							storeInSession("user", JSON.stringify(newUserAuth));

							userContext?.setUserAuth(newUserAuth);

							setUpdatedProfileImage(null);
							toast.dismiss();
							e.target.removeAttribute("disabled");
							toast.success("Uploaded 👍")
						}
					}
				}
			}
		} catch (err) {
			console.log(err);
			toast.dismiss();
			e.target.removeAttribute("disabled");
			toast.error(JSON.stringify(err));
		}
	}

	const handleSubmit = async (e: React.MouseEvent<HTMLButtonElement> & {
		target: HTMLElement}) => {
		try {
			e.preventDefault();
			if (editProfileForm.current) {
				const form = new FormData(editProfileForm.current);
				const formData: Record<string, string> = {};

				for (const [key, value] of form.entries()) {
					formData[key] = String(value);
				}

				const { username, bio, youtube, facebook, twitter, github, instagram, website} = formData;

				if (username.length < 3) {
					return toast.error('Username should be at least 3 letter long')
				}

				if (bio.length > bioLimit) {
					return toast.error(`Bio should not be more than ${bioLimit}`)
				}

				toast.loading('Updating...');
				e.target.setAttribute('disabled', "true");
				const result: {
					data: {
						username: string;
					}
				} = await axios.post(import.meta.env.VITE_SERVER_DOMAIN + '/update-profile', {
					username,
					bio,
					social_links: {
						youtube,
						facebook,
						twitter,
						github,
						instagram,
						website,
					}
				}, {
					headers: {
						'Authorization': `Bearer ${userContext?.userAuth?.access_token}`
					}
				})

				if (result.data.username) {
					if (userContext?.userAuth?.access_token) {
						if (userContext.userAuth.username !== result.data.username) {
							const newUser = {...userContext.userAuth, username: result.data.username};
							storeInSession('user', JSON.stringify(newUser));
							userContext.setUserAuth(newUser);

						}
					}

					toast.dismiss();
					e.target.removeAttribute("disabled");
					toast.success("Profile Updated")
				}


			}


		} catch (err) {
			toast.dismiss();
			e.target.removeAttribute("disabled");
			toast.error(JSON.stringify(err));
		}
	}

	return (
		<PageAnimation>
			{loading ? <Loader/> :
				<form ref={editProfileForm}>
					<h1 className="max-md:hidden">Edit Profile</h1>
					<div
						className="flex flex-col lg:flex-row items-start py-10 gap-8 lg:gap-10">
						<div className="max-lg:center mb-5">
							<label
								htmlFor="uploading" id="profileImageLabel"
								className="relative block w-48 h-48 bg-grey rounded-full overflow-hidden">
								<div
									className="w-full h-full absolute top-0 left-0 flex items-center justify-center text-white bg-black/80 opacity-0 hover:opacity-100 cursor-pointer">
									Upload Image
								</div>
								<img
									ref={profileImageRef}
									src={profile?.personal_info.profile_img}/>
							</label>

							<input
								type="file" id="uploading" hidden
								onChange={handleImagePreview}/>

							<button
								className="btn-light mt-5 max-lg:center lg:w-full px-10"
								onClick={handleImageUpload}
							>Upload
							</button>
						</div>
					</div>
					<div className="w-full">
						<div
							className="grid grid-cols-1 md:grid-cols-2 md:gap-5">
							<div>
								<Input
									name="fullname"
									type="text"
									value={profile?.personal_info.fullname}
									placeholder="Full Name"
									disabled={true}
									icon="fi-rr-user"/>
							</div>
							<div>
								<Input
									name="email"
									type="email"
									value={profile?.personal_info.email}
									placeholder="Email"
									disabled={true}
									icon="fi-rr-envelope"/>
							</div>
						</div>

						<Input
							name="username"
							type="text"
							value={profile?.personal_info.username}
							placeholder="Username"
							icon="fi-rr-at"/>

						<p className="text-dark-grey">Username will use to
							search user and will be visible to all users</p>

						<textarea
							name="bio" maxLength={bioLimit}
							defaultValue={profile?.personal_info.bio}
							className="input-box h-64 lg:h-40 resize-none leading-7 mt-5 pl-5"
							placeholder="Bio"
							onChange={handleChange}
						>
						</textarea>
						<p className="mt-1 text-dark-grey">{charactersLeft} characters
							left</p>
						<p className="my-6 text-dark-grey">Add your social
							handles below</p>
						<div className="md:grid md:grid-cols-2 gap-x-6">
							{profile?.social_links && Object.keys(profile?.social_links).map((key, i) => {
								// eslint-disable-next-line @typescript-eslint/ban-ts-comment
								// @ts-expect-error
								const link = profile.social_links[key];
								return (
									<Input
										icon={`${key !== 'website' ? `fi-brands-${key}` : 'fi-rr-globe'}`}
										key={i} name={key} type="text"
										value={link} placeholder="https://"/>
								)
							})}
						</div>

						<button className="btn-dark w-auto px-10"
								type="submit"
								onClick={handleSubmit}
						>Update
						</button>
					</div>
				</form>
			}
		</PageAnimation>
	)
}

export default EditProfilePage;

