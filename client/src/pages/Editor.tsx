import {createContext, useContext, useState} from "react";
import {UserContext} from "../App.tsx";
import {Blog, BlogContext, UserAuthContext} from "../types.ts";
import {Navigate} from "react-router-dom";
import BlogEditor from "../components/blog-editor.tsx";
import PublishForm from "../components/publish-form.tsx";

const blogStructure: Blog = {
	title: '',
	banner: '',
	content: [],
	tags: [],
	des: '',
	author: { personal_info: {} }
}

export const EditorContext = createContext<BlogContext | null>(null);
const EditorPage = () => {
	const [editorState, setEditorState] = useState<"editor" | "publish">("editor");
	const [blog, setBlog] = useState<Blog>(blogStructure)
	const { userAuth } = useContext(UserContext) as UserAuthContext;

	if (userAuth?.access_token === null)
		return <Navigate to="/signin" />

	return (
		<EditorContext.Provider value={{ blog, setBlog, editorState, setEditorState }}>
			{editorState === "editor" ? <BlogEditor /> : <PublishForm />}
		</EditorContext.Provider>
	)
}

export default EditorPage;
