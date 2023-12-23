import {User} from "../types.ts";
import {Link} from "react-router-dom";

interface UserCardProps {
	data: User
}

const UserCard = ({ data } : UserCardProps) => {
	const { personal_info: { fullname, username, profile_img }} = data;
	console.log('data', data);
	return (
		<Link to={`/user/${username}`} className="flex gap-5 items-center mb-5">
			<img src={profile_img} className="w-14 h-14 rounded-full"/>
			<div>
				<h1 className="font-medium text-xl line-clamp-2">
					{fullname}
				</h1>
				<p className="text-dark-grey"> @{username}</p>
			</div>
		</Link>
	)
}

export default UserCard;
