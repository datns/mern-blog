import {useContext, useEffect} from "react";
import {BlogContext} from "../pages/Blog.tsx";
import {Link} from "react-router-dom";
import {UserContext} from "../App.tsx";
import {toast} from "react-hot-toast";
import axios from "axios";

const BlogInteraction = () => {
	const blogContext = useContext(BlogContext);
	const userContext = useContext(UserContext);

	useEffect(() => {
		async function checkLikeStatus() {
			try {
				const result = await axios.get(import.meta.env.VITE_SERVER_DOMAIN + '/isliked-by-user', {
					params: {
						_id: blogContext?.blog._id,
					},
					headers: {
						'Authorization': `Bearer ${userContext?.userAuth?.access_token}`
					}
				})


				blogContext?.setLiked(!!result.data.result)
			} catch (err) {
				console.log(err);
			}
		}
		if (userContext?.userAuth?.access_token && blogContext?.blog) {
			checkLikeStatus();
		}
	}, [userContext?.userAuth?.access_token, blogContext?.blog._id]);

	if (!blogContext) return null;

	const {
		blog: {title, author, activity: {total_likes, total_comments}, blog_id},
		setBlog, liked, setLiked, setCommentsWrapper
	} = blogContext;

	const handleLike = async () => {
		try {
			if (userContext?.userAuth?.access_token) {
				setLiked(current => !current);
				setBlog(currentBlog =>  {
					if (currentBlog) {
						return {
							...currentBlog,
							activity: {
								...currentBlog.activity,
								total_likes: !liked ? currentBlog.activity.total_likes + 1 : currentBlog.activity.total_likes - 1
							}
						}
					}
					return null
				})

				const result = await axios.post(import.meta.env.VITE_SERVER_DOMAIN + "/like-blog", {
					_id: blogContext?.blog._id,
					liked,
				}, {
					headers: {
						'Authorization': `Bearer ${userContext.userAuth.access_token}`
					}
				})

				console.log('result', result);
			} else {
				toast.error("please login to like this blog");
			}
		} catch (err) {
			console.log(err);
		}
	}

	return (
		<>
			<hr className="border-grey my-2"/>
			<div className="flex gap-6 justify-between">
				<div className="flex gap-3 items-center">
					<button
						onClick={handleLike}
						className={`w-10 h-10 rounded-full flex items-center justify-center ${liked ? 'bg-red/20 text-red': "bg-grey/80" }`}
					>
						<i className={`fi ${liked ? 'fi-sr-heart' : ' fi-rr-heart'}`}></i>
					</button>
					<p className="text-xl text-dark-grey">{total_likes}</p>

					<button
						onClick={() => setCommentsWrapper(pre => !pre)}
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
