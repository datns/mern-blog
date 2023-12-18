export type UserAuth = {
	"access_token": string;
	"profile_img": string;
	"username": string;
	"fullname": string;
} | { "access_token": null }

export type UserAuthContext = {
	userAuth: UserAuth | undefined;
	setUserAuth:  React.Dispatch<React.SetStateAction<UserAuth | undefined>>
}

export type Blog = {
	title: string;
	banner: string;
	content: string[];
	tags: string[];
	des: '',
	author: { personal_info: {}}
}

export type BlogContext = {
	blog: Blog;
	setBlog: (blog: Blog) => void;
	editorState: "editor" | "publish"
	setEditorState: (state: "editor" | "publish") => void;
}
