import {useContext, useEffect} from "react";
import {Link, useNavigate, useParams} from "react-router-dom";
import {toast} from "react-hot-toast";
import PageAnimation from "../common/page-animation.tsx";
import defaultBanner from "../assets/images/default-banner.png"
import logo from '../assets/images/logo.png';
import {EditorContext} from "../pages/Editor.tsx";
import EditorJS from "@editorjs/editorjs";
import {tools} from "./tools.tsx";
import uploadImage from "../common/uploadImage.ts";
import axios from "axios";
import {UserContext} from "../App.tsx";

const BlogEditor = () => {
	const editorContext = useContext(EditorContext);
	const userContext = useContext(UserContext);
	const navigate = useNavigate();
	const {blog_id} = useParams();

	useEffect(() => {
		if (!editorContext?.textEditor?.isReady) {
			const editor = new EditorJS({
				placeholder: "Let's write an awesome story",
				tools: tools,
				data: Array.isArray(editorContext?.blog.content) ? editorContext?.blog.content[0] : editorContext?.blog.content,
			})
			editorContext?.setTextEditor(editor);
		}
	}, [])

	const handleBannerUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
		try {
			const img = e.target.files![0];
			if (img) {
				const loadingToast = toast.loading("Uploading...");
				const res = await uploadImage(img);
				if (res) {
					toast.dismiss(loadingToast);
					toast.success("Uploaded 👍")
					if (editorContext) {
						editorContext.setBlog({
							...editorContext.blog,
							banner: res.data.url
						})
					}
				}
			}
		} catch (err) {
			toast.dismiss()
			toast.error(String(err));
			console.log(err);
		}
	}

	const handleTitleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
		if (e.code === 'Enter') {
			e.preventDefault();
		}
	}

	const handleTitleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
		const input = e.target;

		input.style.height = 'auto';
		input.style.height = input.scrollHeight + "px";

		if (editorContext) {
			editorContext.setBlog({
				...editorContext.blog,
				title: input.value,
			})
		}
	}

	const handlePublishEvent = async () => {
		try {
			if (!editorContext) {
				return toast.error("Something went wrong")
			}

			if (!editorContext?.blog.banner.length) {
				return toast.error("Upload a blog banner to publish it")
			}

			if (!editorContext.blog.title) {
				return toast.error("Write blog title  to publish it")
			}

			if (editorContext.textEditor?.isReady) {
				const result = await editorContext.textEditor.save()
				if (result.blocks.length) {
					editorContext.setBlog({
						...editorContext.blog,
						content: [result]
					});
					editorContext.setEditorState("publish")
				} else {
					toast.error("Write something in your blog to publish it")
				}
			}
		} catch (err) {
			console.log(err)
		}

	}

	const handleSaveDraft = async (e: React.MouseEvent<HTMLButtonElement> & {
		target: HTMLInputElement
	}) => {
		try {
			if (e.target.className.includes("disable")) {
				return;
			}
			if (editorContext?.blog) {
				const {
					title, des, tags, banner, content
				} = editorContext.blog;

				if (!title.length) {
					return toast.error("Write blog title before saving it as a draft")
				}

				const loadingToast = toast.loading("Saving Draft...")

				e.target.classList.add('disable');

				if (editorContext.textEditor?.isReady) {
					await editorContext.textEditor.save();
					const blogObj = {
						title, banner, des, content, tags, draft: true
					}

					const result = await axios.post(import.meta.env.VITE_SERVER_DOMAIN + "/create-blog", {...blogObj, id: blog_id }, {
						headers: {
							'Authorization': `Bearer ${userContext?.userAuth?.access_token}`
						}
					})

					if (result) {
						e.target.classList.remove('disable');
						toast.dismiss(loadingToast);
						toast.success("Saved 👍");

						setTimeout(() => {
							navigate('/')
						}, 500);
					}
				}
			}
		} catch (err) {
			e.target.classList.remove('disable');
			toast.dismiss();
			// eslint-disable-next-line @typescript-eslint/ban-ts-comment
			// @ts-expect-error
			return toast.error(err?.response?.data?.error);
		}
	}


	return (
		<>
			<nav className="navbar">
				<Link to={"/"} className="flex-none w-10">
					<img src={logo}/>
				</Link>
				<p className="max-md:hidden text-black line-clamp-1 w-full">
					{editorContext?.blog?.title?.length || 0 > 0 ? editorContext?.blog.title : 'New Blog'}
				</p>

				<div className="flex gap-4 ml-auto">
					<button className="btn-dark py-2"
							onClick={handlePublishEvent}>
						Publish
					</button>
					<button className="btn-light py-2"
							onClick={handleSaveDraft}>
						Save Draft
					</button>
				</div>
			</nav>
			<PageAnimation>
				<section>
					<div className="mx-auto max-w-[900px]">
						<div
							className="relative aspect-video hover:opacity-80 bg-white border-4 border-grey">
							<label htmlFor="uploadBanner">
								<img
									src={editorContext?.blog?.banner || defaultBanner}
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

					<textarea
						defaultValue={editorContext?.blog.title}
						placeholder="Blog Title"
						className="text-4xl font-medium w-full h-20 outline-none resize-none mt-10 leading-tight
						placeholder:opacity-40"
						onKeyDown={handleTitleKeyDown}
						onChange={handleTitleChange}
					>
					</textarea>

					<hr className="w-full opacity-10 my-5"/>

					<div id="editorjs" className="font-gelasio">

					</div>
				</section>
			</PageAnimation>
		</>
	)
}

export default BlogEditor;
