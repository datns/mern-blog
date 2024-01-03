import {useContext} from "react";
import {BlogContext} from "../pages/Blog.tsx";
import CommentField from "./comment-field.tsx";
import PageAnimation from "../common/page-animation.tsx";
import CommentCard from "./comment-card.tsx";
import NoDataMessage from "./no-data-message.tsx";

interface CommentsContainerProps {
	onLoadMoreComments: () => void;
}
const CommentsContainer = ({ onLoadMoreComments }: CommentsContainerProps) => {
	const blogContext = useContext(BlogContext);
	return (
		<div
			className={`max-sm:w-full fixed duration-700 max-sm:right-0 sm:top-0 w-[30%] min-w-[350px] h-full z-50 bg-white shadow-2xl p-8 px-16 overflow-x-hidden overflow-y-auto ${blogContext?.commentsWrapper ? "top-0 sm:right-0" : "top-[100%] sm:right-[-100%]"}`}>

			<div className="relative">
				<h1 className="text-xl font-medium">Comments</h1>
				<p className="text-lg mt-2 w-[70%] text-dark-grey line-clamp-1">{blogContext?.blog.title}</p>

				<button
					onClick={() => blogContext?.setCommentsWrapper(pre => !pre)}
					className="absolute top-0 right-0 flex justify-center items-center w-12 h-12 rounded-full bg-grey"
				>
					<i className="fi fi-br-cross text-2xl mt-1"></i>
				</button>
			</div>

			<hr className="border-grey my-8 w-[120%] -ml-10"/>

			<CommentField action="comment" />

			{
				blogContext?.blog.commentsDetail && blogContext.blog.commentsDetail.length ?
					blogContext.blog.commentsDetail.map((comment, i) => {
						return (
							<PageAnimation key={i}>
								<CommentCard
									index={i}
									leftVal={comment.childrenLevel * 4}
									data={comment}/>
							</PageAnimation>
						)
					}) : <NoDataMessage message="No Comments"/>
			}

			{
				blogContext &&
				blogContext?.blog.activity.total_parent_comments > blogContext?.totalParentCommentsLoaded
				&&
                <button
					onClick={onLoadMoreComments}
					className="text-dark-grey p-2 px-3 hover:bg-grey/30 rounded-md flex items-center gap-2"
				>
                    Load More
                </button>
			}
		</div>
	)
}

export default CommentsContainer;
