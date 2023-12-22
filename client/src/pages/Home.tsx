import PageAnimation from "../common/page-animation.tsx";
import InPageNavigation from "../components/inpage-navigation.tsx";

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
	return (
		<PageAnimation>
			<section className="h-cover flex justify-center gap-10">
				{/* The latest blogs */}
				<div className="w-full">
					<InPageNavigation routes={routes}>

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
