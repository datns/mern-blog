import {useContext} from "react";
import {EditorContext} from "../pages/Editor.tsx";

export type TagProps =  {
	tag: string;
	tagIndex: number;
}

const Tag = ({tag, tagIndex}: TagProps) => {
	const editorContext = useContext(EditorContext);

	const handleTagDelete = () => {
		const filtered = editorContext?.blog.tags?.filter(t => t !== tag)
		editorContext?.setBlog({
			...editorContext?.blog,
			tags: filtered || [],
		})
	}

	const handleTagEdit = (e: React.KeyboardEvent<HTMLParagraphElement> & { target: HTMLInputElement }) => {
		if (e.key === 'Enter' || e.key === 'Comma') {
			e.preventDefault();

			const editingTag = e.target.innerText;

			const currentTags = editorContext?.blog.tags || [];

			if (currentTags.length > 0) {
				currentTags[tagIndex] = editingTag;
				editorContext?.setBlog({
					...editorContext?.blog,
					tags: currentTags,
				})

				e.target.setAttribute("contentEditable", String(false));
			}

		}
	}

	const addEditable = (e: React.MouseEvent<HTMLParagraphElement> & { target: HTMLInputElement }) => {
		e.target.setAttribute("contentEditable", String(true));
		e.target.focus();
	}

	return (
		<div className="relative p-2 mr-2 px-5 bg-white rounded-full inline-block hover:bg-opacity-50 pr-10">
			<p className="outline-none" onClick={addEditable} onKeyDown={handleTagEdit}>{tag}</p>
			<button
				className="mt-[2px] rounded-full absolute right-3 top-1/2 -translate-y-1/2"
				onClick={handleTagDelete}
			>
				<i className="fi fi-br-cross text-xl pointer-events-none"></i>
			</button>
		</div>
	)
}

export default Tag;
