import {useContext, useState} from "react";
import {UserContext} from "../App.tsx";
import {toast} from "react-hot-toast";
import axios from "axios";
import {BlogContext} from "../pages/Blog.tsx";
import {Comment} from "../types.ts";

interface CommentFieldProps {
	action: string;
	index?: number;
	replyingTo?: string;
	setReplying?: (flag: boolean) => void;
}

const CommentField = ({action, replyingTo, index, setReplying}: CommentFieldProps) => {
	const [comment, setComment] = useState<string>("")
	const blogContext = useContext(BlogContext);
	const userContext = useContext(UserContext);
	const {
		// eslint-disable-next-line @typescript-eslint/ban-ts-comment
		// @ts-expect-error
		userAuth: {
			username,
			fullname,
			profile_img
		}
	} = userContext;

	const handleComment = async () => {
		try {
			if (!userContext?.userAuth?.access_token) {
				return toast.error("Login first to leave a comment")
			}

			if (!comment.length) {
				return toast.error("Write something to leave a comment...")
			}

			const result: {
				data: Comment
			} = await axios.post(import.meta.env.VITE_SERVER_DOMAIN + "/add-comment", {
				_id: blogContext?.blog._id,
				blog_author: blogContext?.blog.author._id,
				comment,
				replying_to: replyingTo
			}, {
				headers: {
					"Authorization": `Bearer ${userContext.userAuth.access_token}`
				}
			})

			if (result) {
				setComment("");
				const currentComments = blogContext?.blog.comments || [];
				const currentCommentsDetail = blogContext?.blog.commentsDetail || [];
				const newCommentDetail: Comment = {
						...result.data,
						commented_by: {
							personal_info: {
								username: String(username),
								profile_img: String(profile_img),
								fullname: String(fullname),
							}
						},
						childrenLevel: replyingTo ?  currentCommentsDetail[index || 0].childrenLevel + 1 : 0,
						parentIndex: replyingTo ? index : undefined,

					};

				console.log('newCommentDetail', newCommentDetail);
				if (replyingTo) {
					if (currentCommentsDetail.length && index !== undefined) {
						currentCommentsDetail[index].children.push(newCommentDetail)
						currentCommentsDetail[index].isReplyLoaded = true;
						currentCommentsDetail.splice(index + 1, 0, newCommentDetail)
					}

					setReplying && setReplying(false);
				}
				const parentCommentIncrementVal = replyingTo ? 0 : 1;


				blogContext?.setBlog({
					...blogContext?.blog,
					comments: [
						...currentComments,
						result.data._id,
					],
					commentsDetail: replyingTo ? [
						...currentCommentsDetail,
					] : [
						newCommentDetail,
						...currentCommentsDetail,
					],
					activity: {
						...blogContext?.blog.activity,
						total_comments: blogContext?.blog.activity.total_comments + 1,
						total_parent_comments: blogContext?.blog.activity.total_parent_comments + parentCommentIncrementVal,
					}
				})

				blogContext?.setTotalParentCommentLoaded(pre => pre + parentCommentIncrementVal);
			}

		} catch (err) {
			console.log(err)
		}


	}

	return (
		<>
			<textarea
				value={comment}
				placeholder="Leave a comment..."
				className="input-box pl-5 placeholder:text-dark-grey resize-none h-[150px] overflow-auto"
				onChange={e => setComment(e.target.value)}
			>
			</textarea>
			<button
				className="btn-dark mt-5 px-10"
				onClick={handleComment}
			>
				{action}
			</button>
		</>
	)
}

export default CommentField;
