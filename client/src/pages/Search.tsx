import {useParams} from "react-router-dom";
import InPageNavigation from "../components/inpage-navigation.tsx";
import Loader from "../components/loader.tsx";
import PageAnimation from "../common/page-animation.tsx";
import BlogCard from "../components/blog-card.tsx";
import NoDataMessage from "../components/no-data-message.tsx";
import {useEffect, useRef, useState} from "react";
import {Blog} from "../types.ts";
import axios from "axios";
import LoadMore from "../components/load-more.tsx";

const SearchPage = () => {
	const {query} = useParams();
	const [blogs, setBlogs] = useState<Blog[] | null>(null);
	const routes = [
		{
			name: `Search Results from "${query}"`,
			hidden: false
		}, {
			name: "Accounts Matched",
			hidden: true
		}
	]

	const paginationRef = useRef<{
		totalDocs: number;
		page: number;
	} | null>(null)

	useEffect(() => {
		setBlogs(null);
		if (query)
			searchBlog({page: 1, query})
	}, [query]);

	const searchBlog = async ({page = 1, query}: {
		page: number;
		query: string
	}) => {
		try {
			const result: {
				data: {
					totalDocs: number;
					blogs: Blog[];
					page: number;
				}
			} = await axios.get(import.meta.env.VITE_SERVER_DOMAIN + '/search-blogs', {
				params: {
					query,
					page,
				}
			})

			if (result) {
				if (page <= 1) {
					setBlogs(result.data.blogs);
				} else {
					setBlogs(current => {
							return [
								...(current || []),
								...result.data.blogs
							]
						}
					)
				}
				paginationRef.current = {
					totalDocs: result.data.totalDocs,
					page: result.data.page,
				}
			}
		} catch (err) {
			console.log(err);
		}
	}

	const handleLoadMore =  () => {
		return searchBlog({
			page: (paginationRef?.current?.page || 0)
				+ 1,
			query: query || ""
		})
	}

	return (
		<section className="h-cover flex justify-center gap-10">
			<div className="w-full">
				<InPageNavigation routes={routes}>
					<>
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
						<LoadMore
							visible={!!blogs && ((paginationRef?.current?.totalDocs || 0) > blogs?.length)}
							onClick={handleLoadMore}/>
					</>
				</InPageNavigation>
			</div>
		</section>
	)
}

export default SearchPage;
