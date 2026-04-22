"use client"

import React, { useEffect, useRef } from "react";
import '@/styles/quill/quill.css'
import 'quill-better-table/dist/quill-better-table.css'
import 'highlight.js/styles/github-dark-dimmed.min.css'
import Quill from "quill";
import { QuillConfig } from "@/config/quill-config";


export interface TextareaProps
	extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
	className?: string,
	defaultValue?: string,
	formats?: string[],
	id?: string,
	onChange: (data: any) => void,
	value?: string,
}

const QuillEditor = React.forwardRef<HTMLTextAreaElement, TextareaProps>((props, ref) => {
	const quillRef = useRef<HTMLDivElement>(null)
	const quillInstanceRef = useRef<Quill | null>(null)
	const isInternalChange = useRef(false)

	// Initialize Quill
	useEffect(() => {
		if (!quillRef.current) return

		// Prevent double initialization in React Strict Mode
		const container = quillRef.current
		if (container.querySelector('.ql-toolbar') || container.classList.contains('ql-container')) {
			return
		}

		const quill = new Quill(container, {
			theme: 'snow',
			modules: QuillConfig
		})

		quillInstanceRef.current = quill

		quill.setContents(quill.clipboard.convert({ html: props.value || props.defaultValue }), 'silent')

		quill.on('editor-change', () => {
			isInternalChange.current = true
			props.onChange(quill.getSemanticHTML())
			// Reset after a tick to allow the prop update to process
			setTimeout(() => {
				isInternalChange.current = false
			}, 0)
		})
	}, []);

	// Update content when value prop changes externally (e.g., from file import)
	useEffect(() => {
		const quill = quillInstanceRef.current
		if (!quill || isInternalChange.current) return

		// Only update if value is different from current content
		const currentHtml = quill.getSemanticHTML()
		if (props.value && props.value !== currentHtml) {
			quill.setContents(quill.clipboard.convert({ html: props.value }), 'silent')
		}
	}, [props.value]);

	return (
		<div className={`quill-wrapper w-full ${props.className || ''}`} ref={quillRef}></div>
	)
})
QuillEditor.displayName = "QuillEditor"
export { QuillEditor }

