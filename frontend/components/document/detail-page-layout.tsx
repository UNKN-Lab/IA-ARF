import { Card } from "@/components/ui/card";
import { Fragment } from "react";
import { cn } from "@/lib/utils";
import * as React from "react";

const DetailPageLayout = (props: {
	children?: React.ReactNode,
}) => {
	return (
		<div className={'grid gap-4 md:grid-cols-[1fr_250px] lg:grid-cols-3 lg:gap-8'}>
			{props.children}
		</div>
	)
}

export default DetailPageLayout

const Main = (props: {
	children?: React.ReactNode,
}) => {
	return (
		<div className={'auto-rows-max lg:col-span-2'}>
			<div className={'space-y-4 lg:space-y-8'}>
				{props.children}
			</div>
		</div>
	)
}
DetailPageLayout.Main = Main

const Right = React.forwardRef<
	HTMLDivElement,
	React.HTMLAttributes<HTMLDivElement>
>(({ ...props }, ref) => {
	return (
		<aside>
			<div
				className={cn(
					"flex flex-col items-end gap-4 lg:gap-8 lg:sticky top-10 lg:h-[calc(100vh-3rem)] overflow-auto lg:pb-4",
				)}
			>
				{props.children}
			</div>
		</aside>
	)
})
Right.displayName = "Right"

DetailPageLayout.Right = Right
