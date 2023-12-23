import PageAnimation from "../common/page-animation.tsx";
import InPageNavigation from "../components/inpage-navigation.tsx";
import axios from "axios";
import {useEffect, useState} from "react";
import Loader from "../components/loader.tsx";
import {Blog} from "../types.ts";
import BlogCard from "../components/blog-card.tsx";
import MinimalBlogCard from "../components/minimal-blog-card.tsx";

const routes = [
	{
		name: 'home',
		hidden: false,
	},
	{
		name: 'Trending blogs',
		hidden: true,
	},
]
const HomePage = () => {
	const [blogs, setBlogs] = useState<Blog[]>();
	const [trendingBlogs, setTrendingBlogs] = useState<Blog[]>();
	const fetchLatestBlogs = async () => {
		try {
			const result: {
				data: {
					blogs: Blog[]
				}
			} = await axios.get(import.meta.env.VITE_SERVER_DOMAIN + '/latest-blogs')
			setBlogs(result.data.blogs);
		} catch (err) {
			console.log(err);
		}
	}

	const fetchTrendingBlogs = async () => {
		try {
			const result: {
				data: {
					blogs: Blog[]
				}
			} = await axios.get(import.meta.env.VITE_SERVER_DOMAIN + '/trending-blogs')
			setTrendingBlogs(result.data.blogs);
		} catch (err) {
			console.log(err);
		}
	}

	useEffect(() => {
		fetchLatestBlogs()
		fetchTrendingBlogs()
	}, []);

	return (
		<PageAnimation>
			<section className="h-cover flex justify-center gap-10">
				{/* The latest blogs */}
				<div className="w-full">
					<InPageNavigation routes={routes}>
						{
							!blogs ? <Loader/> :
								blogs.map((blog, i) => {
									return (
										<PageAnimation
											key={blog.blog_id}
											transition={{
												duration: 1,
												delay: i * .1
										}}>
										<BlogCard data={blog}/>
									</PageAnimation>)
								})
						}
						{/* The filters and trending blogs */}
						{!trendingBlogs ? <Loader/> :
							trendingBlogs.map((blog, i) => {
								return (
									<PageAnimation
										transition={{
											duration: 1,
											delay: i * .1
										}}
										key={blog.blog_id}>
										<MinimalBlogCard data={blog} index={i}/>
									</PageAnimation>
								)
							})
						}
					</InPageNavigation>
				</div>

			</section>
		</PageAnimation>
	)
}

export default HomePage;
