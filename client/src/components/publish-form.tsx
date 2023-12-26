import PageAnimation from "../common/page-animation.tsx";
import {useContext} from "react";
import {EditorContext} from "../pages/Editor.tsx";
import Tag from "./tag.tsx";
import {toast} from "react-hot-toast";
import axios from "axios";
import {UserContext} from "../App.tsx";
import {useNavigate, useParams} from "react-router-dom";

const MAX_CHARACTERS = 200;
const TAG_LIMIT = 10;
const PublishForm = () => {
	const editorContext = useContext(EditorContext);
	const userContext = useContext(UserContext);
	const navigate = useNavigate();
	const {blog_id} = useParams();

	const handleCloseEvent = () => {
		editorContext?.setEditorState("editor");
	}

	const handleBlogTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		editorContext?.setBlog({
			...editorContext?.blog,
			title: e.target.value,
		})
	}

	const handleBlogDesChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
		editorContext?.setBlog({
			...editorContext?.blog,
			des: e.target.value,
		})
	}

	const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
		if (e.code === 'Enter') {
			e.preventDefault();
		}
	}

	const handleTagKeyDown = (e: React.KeyboardEvent<HTMLInputElement> & {
		target: HTMLInputElement
	}) => {
		if (e.code === 'Enter' || e.code === 'Comma') {
			e.preventDefault();
			const tag = e.target.value;
			const currentTags = editorContext?.blog.tags || [];
			if (currentTags.length < TAG_LIMIT) {
				editorContext?.setBlog({
					...editorContext?.blog,
					tags: [
						...currentTags,
						tag
					]
				})
			} else {
				toast.error(`You can add max ${TAG_LIMIT} Tags`)
			}

			e.target.value = "";
		}
	}

	const publishBlog = async (e: React.MouseEvent<HTMLButtonElement> & {
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
					return toast.error("Write blog title before publishing")
				}

				if (!des.length || des.length > MAX_CHARACTERS) {
					return toast.error(`Write a description about your blog withing ${MAX_CHARACTERS} characters`)
				}

				if (!tags.length) {
					return toast.error("Enter at least 1 tag to help us rank your blog")
				}

				const loadingToast = toast.loading("Publishing...")

				e.target.classList.add('disable');

				const blogObj = {
					title, banner, des, content, tags, draft: false
				}

				const result = await axios.post(import.meta.env.VITE_SERVER_DOMAIN + "/create-blog", {
					...blogObj,
					id: blog_id
				}, {
					headers: {
						'Authorization': `Bearer ${userContext?.userAuth?.access_token}`
					}
				})

				if (result) {
					e.target.classList.remove('disable');
					toast.dismiss(loadingToast);
					toast.success("Published 👍");

					setTimeout(() => {
						navigate('/')
					}, 500);
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
		<PageAnimation>
			<section
				className="w-screen min-h-screen grid items-center lg:grid-cols-2 py-16 lg:gap-4">
				<button
					className="w-12 h-12 absolute right-[5vw] z-10 top-[5%] lg:top-[10%]"
					onClick={handleCloseEvent}
				>
					<i className="fi fi-br-cross"></i>
				</button>

				<div className="max-w-[550px]center">
					<p className="text-dark-grey mb-1">Preview</p>

					<div
						className="w-full aspect-video rounded-lg overflow-hidden bg-grey mt-4">
						<img src={editorContext?.blog.banner}/>
					</div>

					<h1 className="text-4xl font-medium mt-2 leading-tight line-clamp-2">
						{editorContext?.blog.title}
					</h1>

					<p className="font-gelasio line-clamp-2 text-xl leading-7 mt-4">
						{editorContext?.blog.des}
					</p>
				</div>

				<div className="border-grey lg:border-2 lg:p-8">
					<p className="text-dark-grey mb-2 mt-9">Blog Title</p>
					<input
						type="text"
						placeholder="Blog Title"
						defaultValue={editorContext?.blog.title}
						className="input-box pl-4"
						onChange={handleBlogTitleChange}
					/>
					<p className="text-dark-grey mb-2 mt-9">
						Short description about your blog
					</p>

					<textarea
						maxLength={MAX_CHARACTERS}
						defaultValue={editorContext?.blog.des}
						className="h-40 resize-none leading-7 input-box pl-4"
						onChange={handleBlogDesChange}
						onKeyDown={handleKeyDown}
					>
					</textarea>

					<p className="mt-1 text-dark-grey text-sm text-right">{MAX_CHARACTERS - (editorContext?.blog?.des?.length || 0)} characters
						left</p>

					<p className="text-dark-grey mb-2 mt-9">
						Topics - (Helps is searching and ranking your blog post)
					</p>

					<div className="relative input-box pl-2 pb-4">
						<input
							type="text"
							placeholder="Topic"
							className="sticky input-box bg-white top-0 left-0 pl-4 mb-3 focus:bg-white"
							onKeyDown={handleTagKeyDown}
						/>
						{editorContext?.blog.tags.map((tag, index) => {
							return <Tag tag={tag} key={tag} tagIndex={index}/>
						})}

					</div>
					<p className="mt-1 mb-4 text-dark-grey text-right">{TAG_LIMIT - (editorContext?.blog.tags || []).length} Tags
						left</p>

					<button
						className="btn-dark px-8"
						onClick={publishBlog}
					>
						Publish
					</button>
				</div>
			</section>
		</PageAnimation>
	)
}

export default PublishForm;
