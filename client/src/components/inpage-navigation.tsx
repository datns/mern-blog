import {PropsWithChildren, useEffect, useRef, useState} from "react";

interface InPageNavigationProps extends PropsWithChildren {
	routes: {
		name: string;
		hidden: boolean;
	}[],
}

const InPageNavigation = ({routes, children}: InPageNavigationProps) => {
	const [index, setIndex] = useState(0);
	const activeTabIndex = useRef<HTMLHRElement | null>(null);
	const tabRefs = useRef<(HTMLButtonElement | null)[]>([]);

	useEffect(() => {
		const currentTab = tabRefs.current[index];
		const hrTag = activeTabIndex.current;
		if (hrTag) {
			hrTag.style.width = currentTab?.offsetWidth + 'px';
			hrTag.style.left = currentTab?.offsetLeft + 'px';
		}
	}, [index]);

	const changePageState = (i: number) => {
		setIndex(i);
	}


	return (
		<>
			<div
				className="relative mb-8 bg-white border-b border-grey flex-nowrap overflow-x-auto">
				{routes.map((route, i) => {
					return (
						<button
							ref={r => tabRefs?.current.push(r)}
							key={route.name}
							className={`p-4 px-5 capitalize ${index === i ? 'text-black' : 'text-dark-grey'} ${route.hidden && 'md:hidden'}`}
							onClick={() => {
								changePageState(i);
							}}
						>
							{route.name}
						</button>
					)
				})}

				<hr ref={activeTabIndex} className="absolute bottom-0 duration-300" />
			</div>
			{Array.isArray(children) ? children[index] : children}
		</>
	)
}

export default InPageNavigation;
