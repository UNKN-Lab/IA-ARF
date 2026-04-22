import React from "react";
import {Button} from "@/components/ui/button";
import Link from "next/link";
import {ChevronLeft} from "lucide-react";

const PageHeading = (props: {
	title: string | React.ReactNode,
	description?: string | React.ReactNode,
	right?: string | React.ReactNode,
	backUrl?: string,
}) => {
	return (
		<div className="container my-8 space-y-1">
			<div className={'flex items-center justify-between'}>
				<div className="space-y-0">
					{Boolean(props.backUrl) && (
						<Button variant={'ghost'} size={'sm'} className={'p-0 hover:bg-transparent!'} asChild>
							<Link href={props.backUrl || "/"} className={'flex items-center'}>
								<ChevronLeft className={'w-4 h-4'} /> Quay lại
							</Link>
						</Button>
					)}
					<h1 className="text-2xl font-medium text-gray-900 leading-8 mb-0">
						{props.title}
					</h1>
				</div>
				{Boolean(props.right) && props.right}
			</div>
			{Boolean(props.description) && (
				<p className={'text-sm text-gray-900 leading-6 whitespace-pre'}>{props.description}</p>
			)}
		</div>
	)
}

export default PageHeading

export const PageHeadingInside = (props: {
	title: string | React.ReactNode,
	description?: string | React.ReactNode,
	right?: string | React.ReactNode,
	backUrl?: string,
}) => {
	return (
		<div className="h-20 flex flex-col justify-end gap-1">
			<div className={'flex items-center justify-between'}>
				<div className="space-y-0">
					{Boolean(props.backUrl) && (
						<Button variant={'ghost'} size={'sm'} className={'p-0 hover:bg-transparent!'} asChild>
							<Link href={props.backUrl || "/"} className={'flex items-center'}>
								<ChevronLeft className={'w-4 h-4'} /> Quay lại
							</Link>
						</Button>
					)}
					<h1 className="text-2xl font-medium text-gray-900 leading-8 mb-0">
						{props.title}
					</h1>
				</div>
				{Boolean(props.right) && props.right}
			</div>
			{Boolean(props.description) && (
				<p className={'text-sm text-gray-900 leading-6'}>{props.description}</p>
			)}
		</div>
	)
}
