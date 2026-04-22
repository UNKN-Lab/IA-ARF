"use client";

import React, { useCallback, useState } from "react";
import { useEditor, EditorContent } from "@tiptap/react";
import { TiptapExtensions } from "@/config/tiptap-config";
import "@/styles/tiptap/tiptap.css";
import {
    Bold,
    Italic,
    Underline,
    Strikethrough,
    List,
    ListOrdered,
    Quote,
    Code,
    Table,
    Undo,
    Redo,
    Plus,
    Trash2,
    Minus,
    ChevronDown,
    RowsIcon,
    ColumnsIcon,
    Check,
} from "lucide-react";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter,
} from "@/components/ui/dialog";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export interface TiptapEditorProps {
    className?: string;
    disabled?: boolean;
    value?: string;
    onChange?: (value: string) => void;
    placeholder?: string;
}

const TiptapEditor = React.forwardRef<HTMLDivElement, TiptapEditorProps>(
    ({ className, disabled, value, onChange, placeholder = "Nhập nội dung..." }, ref) => {
        const [isMounted, setIsMounted] = useState(false);
        const [showTablePopup, setShowTablePopup] = useState(false);
        const [tableRows, setTableRows] = useState(2);
        const [tableCols, setTableCols] = useState(2);

        React.useEffect(() => {
            setIsMounted(true);
        }, []);

        const editor = useEditor({
            immediatelyRender: false,
            extensions: TiptapExtensions,
            content: value || "",
            editable: !disabled,
            onUpdate: ({ editor }) => {
                if (onChange) {
                    const storage = editor.storage as Record<string, any>;
                    if (storage.markdown?.getMarkdown) {
                        onChange(storage.markdown.getMarkdown());
                    } else {
                        onChange(editor.getHTML());
                    }
                }
            },
            editorProps: {
                attributes: {
                    class: "tiptap-editor prose max-w-none focus:outline-none",
                    "data-placeholder": placeholder,
                },
            },
        });

        React.useEffect(() => {
            if (editor && value !== undefined) {
                const storage = editor.storage as Record<string, any>;
                let currentContent = "";
                if (storage.markdown?.getMarkdown) {
                    currentContent = storage.markdown.getMarkdown();
                } else {
                    currentContent = editor.getHTML();
                }
                if (value !== currentContent) {
                    editor.commands.setContent(value);
                }
            }
        }, [editor, value]);

        React.useEffect(() => {
            if (editor) {
                editor.setEditable(!disabled);
            }
        }, [editor, disabled]);

        const insertTable = useCallback(() => {
            if (editor && tableRows > 0 && tableCols > 0) {
                editor
                    .chain()
                    .focus()
                    .insertTable({ rows: tableRows, cols: tableCols, withHeaderRow: true })
                    .run();
                setShowTablePopup(false);
            }
        }, [editor, tableRows, tableCols]);

        // Get current heading level for display
        const getCurrentHeadingLabel = () => {
            if (!editor) return "Normal";
            if (editor.isActive("heading", { level: 2 })) return "Heading 2";
            if (editor.isActive("heading", { level: 3 })) return "Heading 3";
            if (editor.isActive("heading", { level: 4 })) return "Heading 4";
            return "Normal";
        };

        const setHeading = (level: number | null) => {
            if (!editor) return;
            if (level === null) {
                editor.chain().focus().setParagraph().run();
            } else {
                editor.chain().focus().toggleHeading({ level: level as 2 | 3 | 4 }).run();
            }
        };

        if (!isMounted) {
            return <div className="tiptap-wrapper p-4 min-h-[16rem] border rounded-md">Đang tải editor...</div>;
        }

        if (!editor) {
            return <div className="tiptap-wrapper p-4 min-h-[16rem] border rounded-md">Đang khởi tạo editor...</div>;
        }

        return (
            <div className={`tiptap-wrapper ${className || ""}`} ref={ref}>
                {/* Toolbar */}
                <div className="tiptap-toolbar" role="toolbar" aria-label="Formatting options">
                    {/* Undo/Redo */}
                    <div className="tiptap-toolbar-group">
                        <button
                            type="button"
                            onClick={() => editor.chain().focus().undo().run()}
                            disabled={disabled || !editor.can().undo()}
                            title="Undo"
                        >
                            <Undo size={16} />
                        </button>
                        <button
                            type="button"
                            onClick={() => editor.chain().focus().redo().run()}
                            disabled={disabled || !editor.can().redo()}
                            title="Redo"
                        >
                            <Redo size={16} />
                        </button>
                    </div>

                    <div className="tiptap-separator" role="separator" />

                    {/* Heading Dropdown */}
                    <div className="tiptap-toolbar-group">
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild disabled={disabled}>
                                <button
                                    type="button"
                                    className={`heading-dropdown-trigger ${getCurrentHeadingLabel() !== "Normal" ? "is-active" : ""}`}
                                    title="Text style"
                                >
                                    <span>{getCurrentHeadingLabel()}</span>
                                    <ChevronDown size={14} />
                                </button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="start" className="min-w-[150px]">
                                <DropdownMenuItem onClick={() => setHeading(null)} className="flex items-center justify-between">
                                    <span>Normal</span>
                                    {!editor.isActive("heading") && <Check size={14} />}
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={() => setHeading(2)} className="flex items-center justify-between">
                                    <span className="text-lg font-semibold">Heading 2</span>
                                    {editor.isActive("heading", { level: 2 }) && <Check size={14} />}
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={() => setHeading(3)} className="flex items-center justify-between">
                                    <span className="text-base font-semibold">Heading 3</span>
                                    {editor.isActive("heading", { level: 3 }) && <Check size={14} />}
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={() => setHeading(4)} className="flex items-center justify-between">
                                    <span className="text-sm font-semibold">Heading 4</span>
                                    {editor.isActive("heading", { level: 4 }) && <Check size={14} />}
                                </DropdownMenuItem>
                            </DropdownMenuContent>
                        </DropdownMenu>
                    </div>

                    <div className="tiptap-separator" role="separator" />

                    {/* Lists, Quote, Code */}
                    <div className="tiptap-toolbar-group">
                        <button
                            type="button"
                            onClick={() => editor.chain().focus().toggleBulletList().run()}
                            className={editor.isActive("bulletList") ? "is-active" : ""}
                            disabled={disabled}
                            title="Bullet List"
                        >
                            <List size={16} />
                        </button>
                        <button
                            type="button"
                            onClick={() => editor.chain().focus().toggleOrderedList().run()}
                            className={editor.isActive("orderedList") ? "is-active" : ""}
                            disabled={disabled}
                            title="Ordered List"
                        >
                            <ListOrdered size={16} />
                        </button>
                        <button
                            type="button"
                            onClick={() => editor.chain().focus().toggleBlockquote().run()}
                            className={editor.isActive("blockquote") ? "is-active" : ""}
                            disabled={disabled}
                            title="Blockquote"
                        >
                            <Quote size={16} />
                        </button>
                        <button
                            type="button"
                            onClick={() => editor.chain().focus().toggleCodeBlock().run()}
                            className={editor.isActive("codeBlock") ? "is-active" : ""}
                            disabled={disabled}
                            title="Code Block"
                        >
                            <Code size={16} />
                        </button>
                    </div>

                    <div className="tiptap-separator" role="separator" />

                    {/* Inline formatting */}
                    <div className="tiptap-toolbar-group">
                        <button
                            type="button"
                            onClick={() => editor.chain().focus().toggleBold().run()}
                            className={editor.isActive("bold") ? "is-active" : ""}
                            disabled={disabled}
                            title="Bold"
                        >
                            <Bold size={16} />
                        </button>
                        <button
                            type="button"
                            onClick={() => editor.chain().focus().toggleItalic().run()}
                            className={editor.isActive("italic") ? "is-active" : ""}
                            disabled={disabled}
                            title="Italic"
                        >
                            <Italic size={16} />
                        </button>
                        <button
                            type="button"
                            onClick={() => editor.chain().focus().toggleUnderline().run()}
                            className={editor.isActive("underline") ? "is-active" : ""}
                            disabled={disabled}
                            title="Underline"
                        >
                            <Underline size={16} />
                        </button>
                        <button
                            type="button"
                            onClick={() => editor.chain().focus().toggleStrike().run()}
                            className={editor.isActive("strike") ? "is-active" : ""}
                            disabled={disabled}
                            title="Strikethrough"
                        >
                            <Strikethrough size={16} />
                        </button>
                    </div>

                    <div className="tiptap-separator" role="separator" />

                    {/* Table */}
                    <div className="tiptap-toolbar-group">
                        <button
                            type="button"
                            onClick={() => setShowTablePopup(true)}
                            disabled={disabled}
                            title="Insert Table"
                        >
                            <Table size={16} />
                        </button>
                        {editor.isActive("table") && (
                            <>
                                <button
                                    type="button"
                                    onClick={() => editor.chain().focus().addRowAfter().run()}
                                    disabled={disabled}
                                    title="Add Row"
                                >
                                    <Plus size={14} />
                                    <RowsIcon size={12} />
                                </button>
                                <button
                                    type="button"
                                    onClick={() => editor.chain().focus().deleteRow().run()}
                                    disabled={disabled}
                                    title="Delete Row"
                                >
                                    <Minus size={14} />
                                    <RowsIcon size={12} />
                                </button>
                                <button
                                    type="button"
                                    onClick={() => editor.chain().focus().addColumnAfter().run()}
                                    disabled={disabled}
                                    title="Add Column"
                                >
                                    <Plus size={14} />
                                    <ColumnsIcon size={12} />
                                </button>
                                <button
                                    type="button"
                                    onClick={() => editor.chain().focus().deleteColumn().run()}
                                    disabled={disabled}
                                    title="Delete Column"
                                >
                                    <Minus size={14} />
                                    <ColumnsIcon size={12} />
                                </button>
                                <button
                                    type="button"
                                    onClick={() => editor.chain().focus().deleteTable().run()}
                                    disabled={disabled}
                                    title="Delete Table"
                                >
                                    <Trash2 size={14} />
                                </button>
                            </>
                        )}
                    </div>
                </div>

                {/* Editor Content */}
                <EditorContent editor={editor} />


                {/* Table Insert Dialog */}
                <Dialog open={showTablePopup} onOpenChange={setShowTablePopup}>
                    <DialogContent className="sm:max-w-[360px]">
                        <DialogHeader>
                            <DialogTitle>Chèn bảng</DialogTitle>
                        </DialogHeader>
                        <div className="grid gap-4 py-4">
                            <div className="grid grid-cols-4 items-center gap-4">
                                <Label htmlFor="rows" className="text-right">
                                    Số hàng
                                </Label>
                                <Input
                                    id="rows"
                                    type="number"
                                    value={tableRows}
                                    onChange={(e) => setTableRows(Number(e.target.value))}
                                    min={1}
                                    max={20}
                                    className="col-span-3"
                                />
                            </div>
                            <div className="grid grid-cols-4 items-center gap-4">
                                <Label htmlFor="cols" className="text-right">
                                    Số cột
                                </Label>
                                <Input
                                    id="cols"
                                    type="number"
                                    value={tableCols}
                                    onChange={(e) => setTableCols(Number(e.target.value))}
                                    min={1}
                                    max={10}
                                    className="col-span-3"
                                />
                            </div>
                        </div>
                        <DialogFooter>
                            <Button variant="outline" onClick={() => setShowTablePopup(false)}>
                                Huỷ
                            </Button>
                            <Button onClick={insertTable}>
                                Chèn
                            </Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>
            </div>
        );
    }
);

TiptapEditor.displayName = "TiptapEditor";
export { TiptapEditor };
export default TiptapEditor;
