import {Link} from "react-router-dom";
import logo from '../assets/images/logo.png';
import PageAnimation from "../common/page-animation.tsx";
import defaultBanner from "../assets/images/default-banner.png"
import axios from "axios";
import {useState} from "react";
import {toast} from "react-hot-toast";

const BlogEditor = () => {
	const [bannerUrl, setBannerUrl] = useState();
	const handleBannerUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
		try {
			const img = e.target.files![0];
			if (img) {
				const loadingToast = toast.loading("Uploading...");
				const data = new FormData();
				data.append("my_file", img);
				const res = await axios.post(`${import.meta.env.VITE_SERVER_DOMAIN}/upload-image`, data);
				if (res) {
					toast.dismiss(loadingToast);
					toast.success("Uploaded 👍")
					setBannerUrl(res.data.url);
				}
			}
		} catch (err) {
			toast.dismiss()
			toast.error(String(err));
			console.log(err);
		}


	}

	return (
		<>
			<nav className="navbar">
				<Link to={"/"} className="flex-none w-10">
					<img src={logo} />
				</Link>
				<p className="max-md:hidden text-black line-clamp-1 w-full">
					New Blog
				</p>

				<div className="flex gap-4 ml-auto">
					<button className="btn-dark py-2">
						Publish
					</button>
					<button className="btn-light py-2">
						Save Draft
					</button>
				</div>
			</nav>
			<PageAnimation>
				<section>
					<div className="mx-auto max-w-[900px]">
						<div className="relative aspect-video hover:opacity-80 bg-white border-4 border-grey">
							<label htmlFor="uploadBanner">
								<img
									src={bannerUrl || defaultBanner}
									className="z-20"
								/>
								<input
									id="uploadBanner"
									type="file"
									hidden
									onChange={handleBannerUpload}
								/>
							</label>
						</div>
					</div>
				</section>
			</PageAnimation>
		</>
	)
}

export default BlogEditor;
