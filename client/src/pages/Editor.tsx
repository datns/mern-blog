import {createContext, useContext, useEffect, useState} from "react";
import {UserContext} from "../App.tsx";
import {Blog, BlogContext, UserAuthContext} from "../types.ts";
import {Navigate, useParams} from "react-router-dom";
import BlogEditor from "../components/blog-editor.tsx";
import PublishForm from "../components/publish-form.tsx";
import EditorJS from "@editorjs/editorjs";
import Loader from "../components/loader.tsx";
import axios from "axios";

const blogStructure: Blog = {
	title: '',
	banner: '',
	tags: [],
	des: '',
	author: { personal_info: {} }
}

export const EditorContext = createContext<BlogContext | null>(null);
const EditorPage = () => {
	const { blog_id} = useParams();
	const [editorState, setEditorState] = useState<"editor" | "publish">("editor");
	const [textEditor, setTextEditor] = useState<EditorJS>();
	const [blog, setBlog] = useState<Blog>(blogStructure)
	const { userAuth } = useContext(UserContext) as UserAuthContext;
	const [loading, setLoading] = useState(false);

	useEffect(() => {
		async function getBlog() {
			setLoading(true);
			try {
				const result: {
					data: {
						blog: Blog
					}
				} = await axios.get('/get-blog', {
					params: {
						blog_id,
						draft: true,
						mode: 'edit'
					}
				})

				if (result) {
					setBlog(result.data.blog)
				}
			} catch (err) {
				console.log(err);
			} finally {
				setLoading(false)
			}
		}

		if (blog_id)
			getBlog();
	}, [blog_id]);

	if (loading) return <Loader />
	if (userAuth?.access_token === null)
		return <Navigate to="/signin" />

	return (
		<EditorContext.Provider value={{ blog, setBlog, editorState, setEditorState, textEditor, setTextEditor }}>
			{editorState === "editor" ? <BlogEditor /> : <PublishForm />}
		</EditorContext.Provider>
	)
}

export default EditorPage;
