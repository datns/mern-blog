import {Comment} from "../types.ts";
import {format} from "date-fns/format";
import {useContext, useState} from "react";
import {UserContext} from "../App.tsx";
import {toast} from "react-hot-toast";
import CommentField from "./comment-field.tsx";
import  {BlogContext} from "../pages/Blog.tsx";
import axios from "axios";

interface CommentCardProps {
	index: number;
	leftVal: number;
	data: Comment;
}

const CommentCard = ({index, leftVal, data}: CommentCardProps) => {
	const {
		commentedAt,
		commented_by: {personal_info: {fullname, username: commented_by_username, profile_img}},
		comment,
		_id,
	} = data;

	const userContext = useContext(UserContext)
	const blogContext = useContext(BlogContext);
	const [isReplying, setReplying] = useState<boolean>(false);
	const currentComments = blogContext?.blog.commentsDetail || []

	const getParentIndex = () => {
		let startingPoint: number | undefined = index - 1;

		try {
			while(currentComments[startingPoint].childrenLevel >= data.childrenLevel) {
				startingPoint--;
			}
		} catch {
			startingPoint = undefined;
		}

		return startingPoint;
	}
	const removeCommentsCards = (startIndex: number, isDelete = false) => {
		if (currentComments[startIndex]) {
			while (currentComments[startIndex].childrenLevel > data.childrenLevel) {
				currentComments.splice(startIndex, 1);
				if (!currentComments[startIndex])
					break;
			}
		}

		if (isDelete) {
			const parentIndex = getParentIndex();

			if (parentIndex !== undefined) {
				currentComments[parentIndex].children = currentComments[parentIndex].children.filter(child => child._id !== _id)
				if (currentComments[parentIndex].children.length) {
					currentComments[parentIndex].isReplyLoaded = false;
				}
			}

			currentComments.splice(index, 1);
		}

		if (data.childrenLevel === 0 && isDelete) {
			blogContext?.setTotalParentCommentLoaded(pre => pre - 1);
		}
		blogContext?.setBlog({
			...blogContext?.blog,
			commentsDetail: currentComments,
			activity: {
				...blogContext?.blog.activity,
				total_parent_comments: blogContext?.blog.activity.total_parent_comments - (data.childrenLevel === 0 && isDelete ? 1 : 0)
			}
		})
	}

	const hideReplies = () => {
		data.isReplyLoaded = false;
		removeCommentsCards(index + 1);
	}

	const loadReplies = async ({ skip = 0, currentIndex = index } : { skip?: number, currentIndex?: number}) => {
		try {
			if (currentComments[currentIndex].children.length) {
				hideReplies();

				const result: {
					data: {
						replies: Comment[]
					}
				} = await axios.get(import.meta.env.VITE_SERVER_DOMAIN + '/get-replies', {
					params: {
						_id: currentComments[currentIndex]._id, skip
					}
				})

				if (result) {
					data.isReplyLoaded = true;
					for ( let i = 0 ; i < result.data.replies.length; i++) {
						result.data.replies[i].childrenLevel = data.childrenLevel + 1;
						currentComments.splice(currentIndex + 1 + i + skip, 0, result.data.replies[i])

					}

					const commentList = blogContext?.blog.comments || [];
					blogContext?.setBlog({
						...blogContext?.blog,
						comments: [...commentList],
						commentsDetail: [
							...currentComments,
						]
					})
				}
			}
		} catch (err) {
			console.log(err);
		}

	}

	const deleteComment = async (e:  React.MouseEvent<HTMLButtonElement> & { target: HTMLInputElement}) => {
		try {
			e.target.setAttribute("disabled", String(true));
			const result = await axios.post(import.meta.env.VITE_SERVER_DOMAIN + '/delete-comment', {
				_id
			}, {
				headers: {
					'Authorization': `Bearer ${userContext?.userAuth?.access_token}`
				}
			})

			if (result) {
				e.target.setAttribute("disabled", String(false))
				removeCommentsCards(index + 1, true);
			}
		} catch (err) {
			console.log(err)
		}
	}

	const handleReplyClick = () => {
		if (!userContext?.userAuth?.access_token) {
			return toast.error("Login first to leave a reply")
		}

		setReplying(preVal => !preVal);
	}

	const renderLoadMoreRepliesButton = () => {
		const parentIndex = getParentIndex();

		if (currentComments[index + 1]) {
			if (currentComments[index + 1].childrenLevel < currentComments[index].childrenLevel) {
				if ((index - (parentIndex || 0)) < currentComments[parentIndex|| 0].children.length) {
					return <button
						className="text-dark-grey p-2 px-3 hover:bg-grey/30 rounded-md flex items-center gap-2"
						onClick={() => loadReplies({ skip: index - (parentIndex || 0), currentIndex: parentIndex})}
					>Load More Replies</button>
				}

			}
		} else {
			if (parentIndex) {
				if ((index - (parentIndex || 0)) < currentComments[parentIndex|| 0].children.length) {
					return <button
						className="text-dark-grey p-2 px-3 hover:bg-grey/30 rounded-md flex items-center gap-2"
						onClick={() => loadReplies({ skip: index - (parentIndex || 0), currentIndex: parentIndex})}
					>Load More Replies</button>
				}
			}
		}


	}

	return (
		<div className="w-full" style={{paddingLeft: `${leftVal * 10}px`}}>
			<div className="my-5 p-6 rounded-md border border-grey">
				<div className="flex gap-3 items-center mb-8">
					<img src={profile_img} className="w-6 h-6 rounded-full"/>
					<p className="line-clamp-1">{fullname} @{commented_by_username}</p>
					<p className="min-w-fit">{format(commentedAt, 'd MMM')}</p>
				</div>
				<p className="font-gelasio text-xl ml-3">{comment}</p>

				<div
					className="flex gap-5 items-center mt-5"
				>
					{
						data.isReplyLoaded ?
						<button
							className="text-dark-grey p-2 px-3 hover:bg-grey/30 rounded-md flex items-center gap-2"
							onClick={hideReplies}
						>
							<i className="fi fi-rs-comment-dots"></i>Hide Reply
						</button> :
							<button
								className="text-dark-grey p-2 px-3 hover:bg-grey/30 rounded-md flex items-center gap-2"
								onClick={() => loadReplies({ skip: 0 })}
							>
								<i className="fi fi-rs-comment-dots"></i>{data.children.length} Reply
							</button>
					}
					<button
						className="underline"
						onClick={handleReplyClick}
					>
						Reply
					</button>
					{
						userContext?.userAuth?.access_token && userContext.userAuth.username === commented_by_username ||
						userContext?.userAuth?.access_token && userContext.userAuth.username === blogContext?.blog.author.personal_info.username &&
						<button
							className="p-2 px-3 rounded-md border border-grey ml-auto hover:bg-red/30 hover:text-red flex items-center"
							onClick={deleteComment}
						>
							<i className="fi fi-rr-trash  pointer-events-none"></i>
						</button>
					}
				</div>
				{isReplying &&
                    <div className="mt-8">
                        <CommentField
							action="reply"
							index={index}
							replyingTo={data._id}
							setReplying={setReplying}/>
                    </div>
				}
			</div>
			{renderLoadMoreRepliesButton()}
		</div>
	)
}

export default CommentCard;
