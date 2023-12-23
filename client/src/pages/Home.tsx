import PageAnimation from "../common/page-animation.tsx";
import InPageNavigation from "../components/inpage-navigation.tsx";
import axios from "axios";
import {useEffect, useState} from "react";
import Loader from "../components/loader.tsx";
import {Blog} from "../types.ts";
import BlogCard from "../components/blog-card.tsx";
import MinimalBlogCard from "../components/minimal-blog-card.tsx";
import NoDataMessage from "../components/no-data-message.tsx";

const DEFAULT_ROUTE = [
	{
		name: 'Trending blogs',
		hidden: true,
	},
]

const CATEGORIES = ["programming", "hollywood", "film making", "social media", "cooking", "technology", "finances", "travel"];
const HomePage = () => {
	const [blogs, setBlogs] = useState<Blog[] | null>(null);
	const [trendingBlogs, setTrendingBlogs] = useState<Blog[] | null>(null);
	const [pageState, setPageState] = useState<string>("home")

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

	const fetchBlogsByCategory = async () => {
		try {
			const result: {
				data: {
					blogs: Blog[]
				}
			} = await axios.post(import.meta.env.VITE_SERVER_DOMAIN + '/search-blogs', {tag: pageState})
			setBlogs(result.data.blogs);
		} catch (err) {
			console.log(err);
		}
	}

	useEffect(() => {
		if (pageState === 'home') {
			fetchLatestBlogs()

		}
		if (!trendingBlogs) {
			fetchTrendingBlogs()
		} else {
			fetchBlogsByCategory()
		}
	}, [pageState, trendingBlogs]);

	const loadBlogByCategory = (category: string) => {
		setBlogs(null);

		const lowered = category.toLowerCase()
		if (pageState === lowered) {
			setPageState("home");
			return;
		}

		setPageState(lowered);


	}

	return (
		<PageAnimation>
			<section className="h-cover flex justify-center gap-10">
				{/* The latest blogs */}
				<div className="w-full">
					<InPageNavigation routes={[{
						name: pageState,
						hidden: false
					}, ...DEFAULT_ROUTE]}>
						{
							!blogs ? <Loader/> :
								blogs.length ?
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
									}) : (
										<NoDataMessage
											message="No blogs published"/>
									)
						}
						{/* The filters and trending blogs */}
						{!trendingBlogs ? <Loader/> :
							trendingBlogs.length ?
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
								}) : (
									<NoDataMessage message="No trending blogs"/>
								)
						}
					</InPageNavigation>
				</div>

				{/* filters and trending blogs desktop */}
				<div
					className="min-w-[40%] lg:min-w-[400px] max-w-min border-l border-grey pl-8 pt-3 max-md:hidden">
					<div className="flex flex-col gap-10">
						<div>
							<h1 className="font-medium text-xl mb-8">Stories
								from
								all interests</h1>
							<div className="flex gap-3 flex-wrap">
								{
									CATEGORIES.map((category, i) => {
										return <button
											className={`tag ${pageState === category && 'bg-black text-white'}`}
											key={i}
											onClick={() => loadBlogByCategory(category)}>
											{category}
										</button>
									})
								}
							</div>
						</div>
						<div>
							<h1 className="font-medium text-xl mb-8">Trending <i
								className="fi fi-rr-arrow-trend-up"></i></h1>
							{!trendingBlogs ? <Loader/> :
								trendingBlogs.length ?
									trendingBlogs.map((blog, i) => {
										return (
											<PageAnimation
												transition={{
													duration: 1,
													delay: i * .1
												}}
												key={blog.blog_id}>
												<MinimalBlogCard
													data={blog}
													index={i}/>
											</PageAnimation>
										)
									}) : <NoDataMessage
										message="No trending blogs"/>
							}
						</div>
					</div>
				</div>
			</section>
		</PageAnimation>
	)
}

export default HomePage;
