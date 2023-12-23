import {User} from "../types.ts";
import {Link} from "react-router-dom";
import {format} from "date-fns/format";

interface AboutProps {
	bio: string;
	social_links: User["social_links"];
	joinedAt: string;
	className?: string;
}

const About = ({className, bio, social_links, joinedAt}: AboutProps) => {
	return (
		<div className={`md:w-[90%] md:mt-7 ${className}`}>
			<p className="text-xl leading-7">
				{bio.length ? bio : "Nothing to read here"}
			</p>

			<div
				className="flex gap-x-7 gap-y-2 flex-wrap my-7 items-center text-dark-grey">
				{
					Object.keys(social_links).map((key) => {
						// eslint-disable-next-line @typescript-eslint/ban-ts-comment
						// @ts-expect-error
						const link = social_links[key];

						return link ? <Link to={link} target="_blank">
							<i className={`fi ${key !== 'website' ? `fi-brands-${key}` : 'fi-rr-globe'} text-2xl hover:text-black`}></i>
						</Link> : null
					})
				}
			</div>

			<p className="text-xl leading-7 text-dark-grey">
				{format(joinedAt, 'd MMM yyyy')}
			</p>
		</div>
	)
}

export default About
