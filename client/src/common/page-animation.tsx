import {ReactNode} from "react";
import {
	AnimatePresence,
	AnimationControls,
	motion,
	Target,
	TargetAndTransition,
	Transition,
	VariantLabels
} from "framer-motion";

type PageAnimationProps = {
	children: ReactNode;
	initial?: boolean | Target | VariantLabels;
	animate?: AnimationControls | TargetAndTransition | VariantLabels | boolean;
	transition?: Transition;
	className?: string;
}

const PageAnimation = ({
						   children,
						   initial = {opacity: 0},
						   animate = {opacity: 1},
						   transition = {duration: 1},
						   className
					   }: PageAnimationProps) => {
	return (
		<AnimatePresence>
			<motion.div
				initial={initial}
				animate={animate}
				transition={transition}
				className={className}
			>
				{children}
			</motion.div>
		</AnimatePresence>

	)
}

export default PageAnimation;

