"use client";

import React, { useCallback, useState, useRef } from "react";
import { Upload, FileText, Loader2, CheckCircle, AlertCircle } from "lucide-react";
import { parseDocument, isSupportedFileType } from "@/lib/document-parser";

interface FileDropZoneProps {
    onContentParsed: (html: string) => void;
    disabled?: boolean;
    className?: string;
}

type ParseStatus = "idle" | "parsing" | "success" | "error";

export function FileDropZone({ onContentParsed, disabled, className }: FileDropZoneProps) {
    const [isDragOver, setIsDragOver] = useState(false);
    const [status, setStatus] = useState<ParseStatus>("idle");
    const [fileName, setFileName] = useState<string>("");
    const [errorMessage, setErrorMessage] = useState<string>("");
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleFile = useCallback(async (file: File) => {
        if (!isSupportedFileType(file)) {
            setStatus("error");
            setErrorMessage("Chỉ hỗ trợ file .docx, .pdf và .md");
            return;
        }

        setFileName(file.name);
        setStatus("parsing");
        setErrorMessage("");

        try {
            const html = await parseDocument(file);
            setStatus("success");
            onContentParsed(html);

            // Reset to idle after 2 seconds
            setTimeout(() => setStatus("idle"), 2000);
        } catch (error) {
            console.error("Error parsing file:", error);
            setStatus("error");
            setErrorMessage(error instanceof Error ? error.message : "Lỗi khi đọc file");
        }
    }, [onContentParsed]);

    const handleDrop = useCallback((e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDragOver(false);

        if (disabled) return;

        const files = e.dataTransfer.files;
        if (files.length > 0) {
            handleFile(files[0]);
        }
    }, [disabled, handleFile]);

    const handleDragOver = useCallback((e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        e.stopPropagation();
        if (!disabled) {
            setIsDragOver(true);
        }
    }, [disabled]);

    const handleDragLeave = useCallback((e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDragOver(false);
    }, []);

    const handleClick = () => {
        if (!disabled) {
            fileInputRef.current?.click();
        }
    };

    const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = e.target.files;
        if (files && files.length > 0) {
            handleFile(files[0]);
        }
        // Reset input to allow selecting same file again
        e.target.value = "";
    };

    const getStatusContent = () => {
        switch (status) {
            case "parsing":
                return (
                    <>
                        <Loader2 className="w-8 h-8 text-blue-500 animate-spin" />
                        <p className="text-sm text-muted-foreground mt-2">
                            Đang xử lý <span className="font-medium">{fileName}</span>...
                        </p>
                    </>
                );
            case "success":
                return (
                    <>
                        <CheckCircle className="w-8 h-8 text-green-500" />
                        <p className="text-sm text-green-600 mt-2">
                            Đã import thành công!
                        </p>
                    </>
                );
            case "error":
                return (
                    <>
                        <AlertCircle className="w-8 h-8 text-red-500" />
                        <p className="text-sm text-red-600 mt-2">
                            {errorMessage}
                        </p>
                    </>
                );
            default:
                return (
                    <>
                        {isDragOver ? (
                            <FileText className="w-8 h-8 text-blue-500" />
                        ) : (
                            <Upload className="w-8 h-8 text-muted-foreground" />
                        )}
                        <p className="text-sm text-muted-foreground mt-2 text-center">
                            {isDragOver ? (
                                "Thả file vào đây"
                            ) : (
                                <>
                                    Kéo thả file <span className="font-medium">.docx</span>,{" "}
                                    <span className="font-medium">.pdf</span> hoặc{" "}
                                    <span className="font-medium">.md</span>
                                    <br />
                                    <span className="text-xs">hoặc click để chọn file</span>
                                </>
                            )}
                        </p>
                    </>
                );
        }
    };

    return (
        <div
            className={`
        relative border-2 border-dashed rounded-lg p-6
        flex flex-col items-center justify-center
        transition-all duration-200 cursor-pointer
        ${isDragOver ? "border-blue-500 bg-blue-50 dark:bg-blue-950/20" : "border-muted-foreground/25"}
        ${disabled ? "opacity-50 cursor-not-allowed" : "hover:border-muted-foreground/50"}
        ${className || ""}
      `}
            onDrop={handleDrop}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onClick={handleClick}
        >
            <input
                ref={fileInputRef}
                type="file"
                accept=".docx,.doc,.pdf,.md,.markdown"
                onChange={handleFileInputChange}
                className="hidden"
                disabled={disabled}
            />
            {getStatusContent()}
        </div>
    );
}

export default FileDropZone;
