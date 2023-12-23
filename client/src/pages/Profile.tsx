import {Link, useParams} from "react-router-dom";
import {useContext, useEffect, useRef, useState} from "react";
import {Blog, User} from "../types.ts";
import axios from "axios";
import Loader from "../components/loader.tsx";
import PageAnimation from "../common/page-animation.tsx";
import {UserContext} from "../App.tsx";
import About from "../components/about.tsx";
import InPageNavigation from "../components/inpage-navigation.tsx";
import BlogCard from "../components/blog-card.tsx";
import NoDataMessage from "../components/no-data-message.tsx";
import LoadMore from "../components/load-more.tsx";
import NotFoundPage from "./NotFound.tsx";

const ProfilePage = () => {
	const {id} = useParams();
	const [profile, setProfile] = useState<User | null>(null);
	const [loading, setLoading] = useState<boolean>(true);
	const [blogs, setBlogs] = useState<Blog[] | null>(null);
	const userContext = useContext(UserContext);
	const paginationRef = useRef<{
		totalDocs: number;
		page: number;
	} | null>(null)

	useEffect(() => {
		setProfile(null);
		setLoading(true);
		if (id) {
			fetchUserProfile();
		}
	}, [id]);


	const fetchUserProfile = async () => {
		try {
			const result: {
				data: User;
			} = await axios.get(import.meta.env.VITE_SERVER_DOMAIN + "/get-profile", {
				params: {
					username: id
				}
			})

			if (result) {
				setProfile(result.data);
				await fetchBlogs({page: 1, userId: result.data._id});
			}
		} catch (err) {
			console.log(err);
		} finally {
			setLoading(false);
		}
	}

	const fetchBlogs = async ({page = 1, userId}: {
		page: number;
		userId: string
	}) => {
		try {
			const result: {
				data: {
					blogs: Blog[];
					totalDocs: number;
					page: number;
				}
			} = await axios.get(import.meta.env.VITE_SERVER_DOMAIN + '/search-blogs', {
				params: {
					page,
					author: userId,
				}
			})
			console.log(result);
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

	const handleLoadMore = () => {
		if (profile) {
			return fetchBlogs({page: 1, userId: profile._id})
		}
	}

	if (loading) return <Loader/>

	if (!profile) return <NotFoundPage />;

	const {
		personal_info: {fullname, username, profile_img, bio},
		account_info: {total_posts, total_reads}, social_links, joinedAt
	} = profile;

	return (
		<PageAnimation>
			<section
				className="h-cover md:flex flex-row-reverse items-start gap-5 min-[1100px]:gap-12">
				<div
					className="flex flex-col max-md:items-center gap-5 min-w-[250px]
						md:w-[50%] md:pl-8 md:border-l border-grey md:sticky md:top-[100px] md:py-10
					">
					<img
						src={profile_img}
						className="w-48 h-48 bg-grey rounded-full md:w-32 md:h-32"/>
					<h1 className="text-2xl font-medium">{username}</h1>
					<p className="text-xl capitalize h-6">{fullname}</p>

					<p>
						{total_posts.toLocaleString()} Blogs
						- {total_reads.toLocaleString()} Reads
					</p>

					<div className="flex gap-4 mt-2">
						{
							userContext?.userAuth?.access_token && userContext.userAuth.username === id &&
                            <Link to="/settings/edit-profile"
                                  className="btn-light rounded-md">Edit
                                Profile</Link>
						}
					</div>

					<About
						bio={bio}
						social_links={social_links}
						joinedAt={joinedAt}
						className="max-md:hidden"
					/>
				</div>

				<div className="max-md:mt-12 w-full">
					<InPageNavigation routes={[
						{name: 'Blogs Published', hidden: false},
						{name: 'About', hidden: true},
					]}>
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
						<About
							bio={bio}
							social_links={social_links}
							joinedAt={joinedAt}
						/>
					</InPageNavigation>
				</div>
			</section>
		</PageAnimation>
	)
}

export default ProfilePage
