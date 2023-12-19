import {useContext, useEffect} from "react";
import {Link} from "react-router-dom";
import {toast} from "react-hot-toast";
import PageAnimation from "../common/page-animation.tsx";
import defaultBanner from "../assets/images/default-banner.png"
import logo from '../assets/images/logo.png';
import {EditorContext} from "../pages/Editor.tsx";
import EditorJS from "@editorjs/editorjs";
import {tools} from "./tools.tsx";
import uploadImage from "../common/uploadImage.ts";

const BlogEditor = () => {
	const editorContext = useContext(EditorContext);

	useEffect(() => {
		const editor = new EditorJS({
			placeholder: "Let's write an awesome story",
			tools: tools,
		})
		editorContext?.setTextEditor(editor);
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

		input.style.height= 'auto';
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
				const result  = await editorContext.textEditor.save()
				console.log('result', result);
				if (result.blocks.length) {
					editorContext.setBlog({...editorContext.blog, content: result });
					editorContext.setEditorState("publish")
				} else {
					toast.error("Write something in your blog to publish it")
				}
			}
		} catch (err) {
			console.log(err)
		}

	}


	return (
		<>
			<nav className="navbar">
				<Link to={"/"} className="flex-none w-10">
					<img src={logo} />
				</Link>
				<p className="max-md:hidden text-black line-clamp-1 w-full">
					{editorContext?.blog?.title?.length || 0 > 0 ? editorContext?.blog.title : 'New Blog'}
				</p>

				<div className="flex gap-4 ml-auto">
					<button className="btn-dark py-2" onClick={handlePublishEvent}>
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
						placeholder="Blog Title"
						className="text-4xl font-medium w-full h-20 outline-none resize-none mt-10 leading-tight
						placeholder:opacity-40"
						onKeyDown={handleTitleKeyDown}
						onChange={handleTitleChange}
					>
					</textarea>

					<hr className="w-full opacity-10 my-5" />

					<div id="editorjs" className="font-gelasio">

					</div>
				</section>
			</PageAnimation>
		</>
	)
}

export default BlogEditor;
