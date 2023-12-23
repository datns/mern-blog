import {Blog} from "../types.ts";
import {Link} from "react-router-dom";
import {format} from "date-fns/format";

interface MinimalBlogCardProps {
	data: Blog;
	index: number
}

const MinimalBlogCard = ({ data, index }: MinimalBlogCardProps) => {
	const { title,publishedAt ,blog_id, author: { personal_info: { fullname, profile_img, username }}} = data;
	return (
		<Link to={`/blog/${blog_id}`} className="flex gap-5 mb-4">
			<h1 className="blog-index">{index < 10 ? "0" + (index+1) : index}</h1>

			<div>
				<div className="flex gap-2 items-center mb-7">
					<img src={profile_img} className="w-6 h-6 rounded-full"/>
					<p className="line-clamp-1">
						{fullname} @{username}
					</p>
					<p className="min-w-fit">{format(publishedAt, "d MMM")}</p>
				</div>

				<h1 className="blog-title">{title}</h1>
			</div>
		</Link>
	)
}

export default MinimalBlogCard
