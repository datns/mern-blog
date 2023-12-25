import {useContext} from "react";
import {BlogContext} from "../pages/Blog.tsx";
import {Link} from "react-router-dom";
import {UserContext} from "../App.tsx";

const BlogInteraction = () => {
	const blogContext = useContext(BlogContext);
	const userContext = useContext(UserContext);
	if (!blogContext) return null;

	const {
		blog: {title, author, activity: {total_likes, total_comments}, blog_id},
		setBlog
	} = blogContext;
	return (
		<>
			<hr className="border-grey my-2"/>
			<div className="flex gap-6 justify-between">
				<div className="flex gap-3 items-center">
					<button
						className="w-10 h-10 rounded-full flex items-center justify-center bg-grey/80"
					>
						<i className="fi fi-rr-heart"></i>
					</button>
					<p className="text-xl text-dark-grey">{total_likes}</p>

					<button
						className="w-10 h-10 rounded-full flex items-center justify-center bg-grey/80"
					>
						<i className="fi fi-rr-comment-dots"></i>
					</button>
					<p className="text-xl text-dark-grey">{total_comments}</p>
				</div>

				<div className="flex gap-6 items-center">
					{userContext?.userAuth?.access_token && userContext.userAuth.username === author.personal_info.username &&
                        <Link to={`/editor/${blog_id}`}
                              className="underline hover:text-purple">Edit</Link>
					}
					<Link
						to={`https://twitter.com/intent/tweet?text=Read ${title}&url=${location.href}`}>
						<i className="fi fi-brands-twitter text-xl hover:text-twitter"></i>
					</Link>
				</div>
			</div>

			<hr className="border-grey my-2"/>
		</>
	)
}

export default BlogInteraction;
