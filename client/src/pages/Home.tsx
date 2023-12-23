import PageAnimation from "../common/page-animation.tsx";
import InPageNavigation from "../components/inpage-navigation.tsx";
import axios from "axios";
import {useEffect, useState} from "react";
import Loader from "../components/loader.tsx";
import {Blog} from "../types.ts";
import BlogCard from "../components/blog-card.tsx";

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
	const fetchLatestBlogs = async () => {
		try {
			const result: {
				data: {
					blogs: Blog[]
				}
			} = await axios.get(import.meta.env.VITE_SERVER_DOMAIN + '/latest-blogs')
			console.log('result', result);
			setBlogs(result.data.blogs);
		} catch (err) {
			console.log(err);
		}
	}

	useEffect(() => {
		fetchLatestBlogs()
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
									return <PageAnimation key={blog.blog_id} transition={{
										duration: 1,
										delay: i * .1
									}}>
										<BlogCard data={blog}/>
									</PageAnimation>
								})
						}
					</InPageNavigation>
				</div>

				{/* The filters and trending blogs */}
				<div>

				</div>
			</section>
		</PageAnimation>
	)
}

export default HomePage;
