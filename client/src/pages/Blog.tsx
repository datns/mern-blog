import {Link, useParams} from "react-router-dom";
import axios from "axios";
import {createContext, useEffect, useState} from "react";
import {Blog} from "../types.ts";
import Loader from "../components/loader.tsx";
import PageAnimation from "../common/page-animation.tsx";
import {format} from "date-fns/format";
import BlogInteraction from "../components/blog-interaction.tsx";
import BlogCard from "../components/blog-card.tsx";

export const BlogContext = createContext<{
	blog: Blog,
	setBlog: (blog: Blog) => void
} | null>(null);
const BlogPage = () => {
	const {blog_id} = useParams();
	const [blog, setBlog] = useState<Blog | null>(null);
	const [similarBlogs, setSimilarBlogs] = useState<Blog[] | null>(null);
	const [loading, setLoading] = useState(true);
	useEffect(() => {
		setSimilarBlogs(null)
		setBlog(null);
		fetchBlog();
	}, [blog_id]);

	const fetchBlog = async () => {
		setLoading(true)
		try {
			const result: {
				data: {
					blog: Blog
				}
			} = await axios.get(import.meta.env.VITE_SERVER_DOMAIN + "/get-blog", {
				params: {
					blog_id
				}
			})

			if (result) {
				setBlog(result.data.blog)
				const similarBlogsResult: {
					data: {
						blogs: Blog[]
					}
				} = await axios.get(import.meta.env.VITE_SERVER_DOMAIN + '/search-blogs', {
					params: {
						tag: result.data.blog.tags[0],
						eliminate_blog: result.data.blog.blog_id,
						limit: 6,
					}
				})

				if (similarBlogsResult) {
					setSimilarBlogs(similarBlogsResult.data.blogs)
				}
			}

			console.log('result', result)
		} catch (err) {
			console.log(err)
		} finally {
			setLoading(false)
		}
	}

	if (loading) return <Loader/>

	if (!blog) return null;

	const {
		title,
		author: {personal_info: {profile_img, fullname, username}},
		banner,
		publishedAt
	} = blog;

	return (
		<PageAnimation>
			<BlogContext.Provider value={{blog, setBlog}}>
				<div className="max-w-[900px] center py-10 max-lg:px-[5vw]">
					<img src={banner} className="aspect-video"/>
					<div className="mt-12">
						<h2>{title}</h2>

						<div
							className="flex max-sm:flex-col justify-between my-8">
							<div className="flex gap-5 items-start">
								<img
									src={profile_img}
									className="w-12 h-12 rounded-full"
								/>
								<p>
									{fullname}
									<br/>
									<Link
										to={`/user/${username}`}
										className="underline"
									>
										{username}
									</Link>
								</p>
							</div>
							<p className="text-dark-grey opacity-75 max-sm:mt-6 max-sm:ml-12 max-sm:pl-5">Published
								on {format(publishedAt, "d MMM")}</p>
						</div>
					</div>

					<BlogInteraction/>

					<BlogInteraction/>

					{
						similarBlogs !== null && similarBlogs.length &&
							<>
								<h1 className="text-2xl mt-14 mb-10 font-medium">Similar Blogs</h1>

								{similarBlogs.map((blog, i) => {
									return (
										<PageAnimation key={blog.blog_id} transition={{ duration: 1, delay: i * .1}}>
											<BlogCard data={blog} />
										</PageAnimation>
									)
								})
								}
							</>
					}

				</div>
			</BlogContext.Provider>
		</PageAnimation>
	)
}

export default BlogPage;
