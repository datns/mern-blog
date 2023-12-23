interface LoadMoreProps {
	visible: boolean;
	onClick: () => void;
}

const LoadMore = ({visible, onClick}: LoadMoreProps) => {
	if (!visible) return null;
	return (
		<button
			onClick={onClick}
			className="text-dark-grey p-2 px-3 hover:bg-grey/30 rounded-md flex items-center gap-2"
		>
			Load More
		</button>
	)

}

export default LoadMore;
