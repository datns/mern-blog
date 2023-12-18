import {useContext, useState} from "react";
import {UserContext} from "../App.tsx";
import {UserAuthContext} from "../types.ts";
import {Navigate} from "react-router-dom";
import BlogEditor from "../components/blog-editor.tsx";
import PublishForm from "../components/publish-form.tsx";

const EditorPage = () => {
	const [editorState, setEditorState] = useState<"editor" | "publish">("editor");
	const { userAuth } = useContext(UserContext) as UserAuthContext;

	if (userAuth?.access_token === null)
		return <Navigate to="/signin" />

	return (
		<>
			{editorState === "editor" ? <BlogEditor /> : <PublishForm />}
		</>
	)
}

export default EditorPage;
