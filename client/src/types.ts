import EditorJS, {OutputData} from "@editorjs/editorjs";

export type UserAuth = {
	access_token: string;
	profile_img: string;
	username: string;
	fullname: string;
} | { access_token: null }

export type UserAuthContext = {
	userAuth: UserAuth | undefined;
	setUserAuth: React.Dispatch<React.SetStateAction<UserAuth | undefined>>
}

export type User = {
	personal_info: {
		fullname: string;
		profile_img: string;
		username: string;
		bio: string;
	},
	social_links: {
		youtube: string;
		instagram: string;
		facebook: string;
		twitter: string;
		github: string;
		website: string;
	},
	account_info: {
		total_posts: number,
		total_reads: number;
	},
	joinedAt: string;
	_id: string;
}

export interface Comment {
	_id: string;
	blog_id: string;
	blog_author: string;
	children: Comment[];
	commented_by: {
		personal_info: {
			fullname: string;
			profile_img: string;
			username: string;
		},
	},
	commentedAt: string;
	updatedAt: string;
	childrenLevel: number;
	comment: string;
	parentIndex?: number;
	isReplyLoaded: boolean;
}

export type Blog = {
	_id: string;
	title: string;
	banner: string;
	content: OutputData[];
	tags: string[];
	des: string;
	author: User;
	publishedAt: string;
	activity: {
		total_likes: number;
		total_comments: number;
		total_parent_comments: number;
	};
	blog_id: string;
	comments: string[];
	commentsDetail: Comment[]
}


export type BlogContext = {
	blog: Blog;
	setBlog: (blog: Blog) => void;
	editorState: "editor" | "publish"
	setEditorState: (state: "editor" | "publish") => void;
	textEditor: EditorJS | undefined;
	setTextEditor: (editor: EditorJS) => void;
}
