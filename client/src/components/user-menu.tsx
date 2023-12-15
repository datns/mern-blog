import PageAnimation from "../common/page-animation.tsx";
import {Link} from "react-router-dom";
import {useContext} from "react";
import {UserContext} from "../App.tsx";
import {UserAuthContext} from "../types.ts";
import {removeFromSession} from "../common/session.ts";

const UserMenu = () => {
	const { userAuth, setUserAuth } = useContext(UserContext) as UserAuthContext;

	const onSignOut = () => {
		console.log('run');
		removeFromSession("user");
		setUserAuth({ access_token: null })
	}

	return (
		<PageAnimation
			transition={{ duration: 0.2 }}
			className="absolute right-0 z-50"
		>
			<div className="bg-white absolute right-0 border border-grey w-60 duration-200">
				<Link to={"/editor"} className="flex gap-2 link md:hidden pl-8 py-4">
					<i className="fi fi-rr-file-edit"></i>
					<p>Write</p>
				</Link>

				{userAuth?.access_token &&
					(
						<Link to={`/user/${userAuth?.username}`} className="link pl-8 py-4">
							Profile
						</Link>
					)
				}

				<Link to={`/dashboard/blogs`} className="link pl-8 py-4">
					Dashboard
				</Link>

				<Link to={`/settings/edit-profile`} className="link pl-8 py-4 border-b border-b-grey">
					Settings
				</Link>

				<button
					className="text-left p-4 hover:bg-grey w-full pl-8 py-4"
					onClick={onSignOut}
				>
					<h1 className="font-bold text-xl mt-1">Sign Out</h1>
					<p className="text-dark-grey">@{userAuth?.access_token && userAuth.username}</p>
				</button>

			</div>
		</PageAnimation>
	)
}

export default UserMenu;
