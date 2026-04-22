"use client";

import React, { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { toast } from "sonner";

import documentApiRequest from "@/apiRequests/document";
import { DocumentResponseType } from "@/schemaValidation/document.schema";
import DocumentForm from "@/components/document/document-form";

export default function UpdateDocumentPage() {
    const params = useParams();
    const router = useRouter();
    const [document, setDocument] = useState<DocumentResponseType | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    const documentId = Number(params.id);

    useEffect(() => {
        if (documentId) {
            fetchDocument();
        }
    }, [documentId]);

    const fetchDocument = async () => {
        try {
            setIsLoading(true);
            const response = await documentApiRequest.getDetail(documentId);
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
                </div>
            </div>
        );
    }

    return (
        <DocumentForm
            mode="edit"
            documentId={documentId}
            initialData={document}
        />
    );
}
