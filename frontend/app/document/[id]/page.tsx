"use client";

import React, { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { toast } from "sonner";
import { ArrowLeft, Calendar, Tag, User } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import documentApiRequest from "@/apiRequests/document";
import { DocumentResponseType } from "@/schemaValidation/document.schema";
import MarkdownMessage from "@/components/chat/MarkdownMessage";

// Type label mapping
const typeLabels: Record<string, string> = {
    program: "Chương trình đào tạo",
    syllabus: "Đề cương môn học",
    policy: "Quy định",
};

export default function DocumentDetailPage() {
    const params = useParams();
    const router = useRouter();
    const [document, setDocument] = useState<DocumentResponseType | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    const documentId = params.id as string;

    useEffect(() => {
        if (documentId) {
            fetchDocument();
        }
    }, [documentId]);

    const fetchDocument = async () => {
        try {
            setIsLoading(true);
            const response = await documentApiRequest.getDetail(Number(documentId));
            setDocument(response.payload);
        } catch (error: any) {
            toast.error(error?.payload?.message || "Không thể tải tài liệu");
            router.push("/document");
        } finally {
            setIsLoading(false);
        }
    };

    if (isLoading) {
        return (
            <div className="container py-6">
                <div className="flex items-center justify-center py-12">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
                </div>
            </div>
        );
    }

    if (!document) {
        return (
            <div className="container py-6">
                <div className="text-center py-12 text-gray-500">
                    <p>Không tìm thấy tài liệu</p>
                    <Button
                        variant="link"
                        onClick={() => router.push("/document")}
                        className="mt-2"
                    >
                        Quay lại danh sách
                    </Button>
                </div>
            </div>
        );
    }

    return (
        <div className="h-full overflow-y-auto">
            <div className="container py-6 max-w-4xl mx-auto">
                {/* Back Button */}
                <Button
                    variant="ghost"
                    onClick={() => router.push("/document")}
                    className="mb-4 -ml-2"
                >
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    Quay lại danh sách
                </Button>

                {/* Document Header */}
                <Card className="mb-6">
                    <CardHeader className="pb-4">
                        <h1 className="text-2xl font-bold text-gray-900">
                            {document.title}
                        </h1>
                        <div className="flex flex-wrap gap-4 mt-3 text-sm text-gray-600">
                            <div className="flex items-center gap-1.5">
                                <Tag className="w-4 h-4" />
                                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                                    {typeLabels[document.type] || document.type}
                                </span>
                            </div>
                            <div className="flex items-center gap-1.5">
                                <Calendar className="w-4 h-4" />
                                <span>Năm học: {document.academic_year}</span>
                            </div>
                            {document.created_at && (
                                <div className="flex items-center gap-1.5">
                                    <User className="w-4 h-4" />
                                    <span>
                                        Tạo lúc: {new Date(document.created_at).toLocaleDateString("vi-VN", {
                                            year: "numeric",
                                            month: "long",
                                            day: "numeric",
                                            hour: "2-digit",
                                            minute: "2-digit",
                                        })}
                                    </span>
                                </div>
                            )}
                        </div>
                    </CardHeader>
                </Card>

                {/* Document Content */}
                <Card>
                    <CardContent className="p-6 prose prose-slate max-w-none">
                        <MarkdownMessage content={document.body} />
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
