import {useParams} from "react-router-dom";
import InPageNavigation from "../components/inpage-navigation.tsx";
import Loader from "../components/loader.tsx";
import PageAnimation from "../common/page-animation.tsx";
import BlogCard from "../components/blog-card.tsx";
import NoDataMessage from "../components/no-data-message.tsx";
import {useEffect, useRef, useState} from "react";
import {Blog, User} from "../types.ts";
import axios from "axios";
import LoadMore from "../components/load-more.tsx";
import UserCard from "../components/user-card.tsx";

const SearchPage = () => {
	const {query} = useParams();
	const [blogs, setBlogs] = useState<Blog[] | null>(null);
	const [users, setUsers] = useState<User[] | null>(null)

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
		setUsers(null);
		if (query) {
			searchBlog({page: 1, query})
			searchUsers();
		}
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

	const searchUsers = async () => {
		try {
			const result: {
				data: {
					users: User[]
				}
			} = await axios.get(import.meta.env.VITE_SERVER_DOMAIN + "/search-users", {
				params: {
					query
				}
			})

			if (result) {
				setUsers(result.data.users)
			}

		} catch (err) {
			console.log(err);
		}
	}

	const handleLoadMore = () => {
		return searchBlog({
			page: (paginationRef?.current?.page || 0)
				+ 1,
			query: query || ""
		})
	}

	const renderSearchedUser = () => {
		return (
			<>
				{!users ? <Loader/> :
					users.length ?
						users.map((user, i) => {
								return (
									<PageAnimation
										key={user.personal_info.username}
										transition={{
											duration: 1,
											delay: i * .1
										}}
									>
										<UserCard data={user} />
									</PageAnimation>
								)
							}
						) :
						<NoDataMessage message="No user found"/>
				}
			</>
		)
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
					{renderSearchedUser()}
				</InPageNavigation>
			</div>

			<div className="min-w-[40%] lg:min-w-[350px[ max-w-min border-l border-grey pl-8 pt-3 max-md:hidden">
				<h1 className="font-medium text-xl mb-8">
					User related to search <i className="fi fi-rr-user mt-1"></i>
				</h1>
				{renderSearchedUser()}
			</div>
		</section>
	)
}

export default SearchPage;
