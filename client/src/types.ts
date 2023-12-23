import EditorJS, {OutputData} from "@editorjs/editorjs";

export type UserAuth = {
	"access_token": string;
	"profile_img": string;
	"username": string;
	"fullname": string;
} | { "access_token": null }

export type UserAuthContext = {
	userAuth: UserAuth | undefined;
	setUserAuth: React.Dispatch<React.SetStateAction<UserAuth | undefined>>
}

export type Blog = {
	title: string;
	banner: string;
	content?: OutputData;
	tags: string[];
	des: string;
	author: {
		personal_info: {
			fullname: string;
			profile_img: string;
			username: string;
		}
	};
	publishedAt: string;
	activity: {
		total_likes: number;
	};
	blog_id: string;
}

export type BlogContext = {
	blog: Blog;
	setBlog: (blog: Blog) => void;
	editorState: "editor" | "publish"
	setEditorState: (state: "editor" | "publish") => void;
	textEditor: EditorJS | undefined;
	setTextEditor: (editor: EditorJS) => void;
}
