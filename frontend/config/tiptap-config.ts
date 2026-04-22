import StarterKit from "@tiptap/starter-kit";
import Underline from "@tiptap/extension-underline";
import { Table } from "@tiptap/extension-table";
import { TableRow } from "@tiptap/extension-table-row";
import { TableCell } from "@tiptap/extension-table-cell";
import { TableHeader } from "@tiptap/extension-table-header";
import { Markdown } from "tiptap-markdown";

export const TiptapExtensions = [
    StarterKit.configure({
        heading: {
            levels: [2, 3, 4],
        },
        codeBlock: {
            HTMLAttributes: {
                class: "code-block",
            },
        },
    }),
    Underline,
    Table.configure({
        resizable: true,
        HTMLAttributes: {
            class: "tiptap-table",
        },
    }),
    TableRow,
    TableCell,
    TableHeader,
    Markdown.configure({
        html: false,
        transformPastedText: true,
        transformCopiedText: true,
    }),
];
