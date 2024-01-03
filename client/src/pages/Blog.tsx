import {Link, useParams} from "react-router-dom";
import axios from "axios";
import React, {createContext, useEffect, useState} from "react";
import {Blog, Comment} from "../types.ts";
import Loader from "../components/loader.tsx";
import PageAnimation from "../common/page-animation.tsx";
import {format} from "date-fns/format";
import BlogInteraction from "../components/blog-interaction.tsx";
import BlogCard from "../components/blog-card.tsx";
import BlogContent from "../components/blog-content.tsx";
import CommentsContainer from "../components/comments-container.tsx";

export const BlogContext = createContext<{
	blog: Blog;
	setBlog: React.Dispatch<React.SetStateAction<Blog | null>>;
	liked: boolean;
	setLiked: React.Dispatch<React.SetStateAction<boolean>>;
	commentsWrapper: boolean;
	setCommentsWrapper: React.Dispatch<React.SetStateAction<boolean>>;
	totalParentCommentsLoaded: number;
	setTotalParentCommentLoaded: React.Dispatch<React.SetStateAction<number>>;
} | null>(null);
const BlogPage = () => {
	const {blog_id} = useParams();
	const [blog, setBlog] = useState<Blog | null>(null);
	const [similarBlogs, setSimilarBlogs] = useState<Blog[] | null>(null);
	const [loading, setLoading] = useState(true);
	const [liked, setLiked] = useState<boolean>(false);
	const [commentsWrapper, setCommentsWrapper] = useState<boolean>(false);
	const [totalParentCommentsLoaded, setTotalParentCommentLoaded] = useState<number>(0)

	useEffect(() => {
		setSimilarBlogs(null)
		setBlog(null);
		setLiked(false);
		setCommentsWrapper(false);
		setTotalParentCommentLoaded(0)
		fetchBlog();
	}, [blog_id]);

	const fetchComments = async (currentBlog: Blog, id: string, skip = 0): Promise<Blog> => {
		try {
			let comments;
			const result: {
				data: Comment[]
			} = await axios.get(import.meta.env.VITE_SERVER_DOMAIN + '/get-blog-comments', {
				params: {
					blog_id: id,
					skip,
				}
			})
			if (result.data.length) {
				const commentObj = result.data.map(item => {
					return {
						...item,
						childrenLevel: 0,
					}
				})

				setTotalParentCommentLoaded(preVal => preVal + result.data.length)
				if (blog?.commentsDetail.length) {
					const currents = blog?.commentsDetail || []
					comments = [
						...currents,
						...commentObj
					]
				} else {
					comments = [...commentObj]
				}
			}
			return {
				...currentBlog,
				commentsDetail: comments || [],
			}
		} catch (err) {
			console.log(err);
			throw Error();
		}
	}

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
				const newBlog = await fetchComments(result.data.blog, result.data.blog._id, 0);
				setBlog(newBlog)
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

	const onLoadMoreComments = async () => {
		if (blog) {
			const newBlog = await fetchComments(blog, blog?._id, totalParentCommentsLoaded);
			setBlog(newBlog);
		}
	}

	if (loading) return <Loader/>

	if (!blog) return null;

	const {
		title,
		author: {personal_info: {profile_img, fullname, username}},
		banner,
		publishedAt,
		content,
	} = blog;

	return (
		<PageAnimation>
			<BlogContext.Provider value={{
				blog,
				setBlog,
				liked,
				setLiked,
				commentsWrapper,
				setCommentsWrapper,
				totalParentCommentsLoaded,
				setTotalParentCommentLoaded
			}}>
				<CommentsContainer onLoadMoreComments={onLoadMoreComments}/>

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

					<div className="my-12 font-gelasio blog-page-content">
						{content[0].blocks.map((block) => {
							return (
								<div key={block.id} className="my-4 md:my-8">
									<BlogContent block={block}/>
								</div>
							)
						})}
					</div>

					<BlogInteraction/>

					{
						similarBlogs !== null && similarBlogs.length &&
                        <>
                            <h1 className="text-2xl mt-14 mb-10 font-medium">Similar
                                Blogs</h1>

							{similarBlogs.map((blog, i) => {
								return (
									<PageAnimation
										key={blog.blog_id}
										transition={{
											duration: 1,
											delay: i * .1
									}}>
										<BlogCard data={blog}/>
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
