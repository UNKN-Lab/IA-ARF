"use client";

import React, { useEffect, useState, useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Trash2, Plus, FileText, Eye, Pencil } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
    Pagination,
    PaginationContent,
    PaginationItem,
    PaginationLink,
    PaginationNext,
    PaginationPrevious,
} from "@/components/ui/pagination";
import documentApiRequest from "@/apiRequests/document";
import { DocumentResponseType } from "@/schemaValidation/document.schema";

// Type label mapping
const typeLabels: Record<string, string> = {
    program: "Chương trình đào tạo",
    syllabus: "Đề cương môn học",
    policy: "Quy định",
};

const ITEMS_PER_PAGE = 10;

export default function DocumentPage() {
    const [documents, setDocuments] = useState<DocumentResponseType[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isPending, startTransition] = useTransition();
    const [role, setRole] = useState<string | null>(null);
    const router = useRouter();

    // Pagination state
    const [currentPage, setCurrentPage] = useState(1);
    const [total, setTotal] = useState(0);
    const totalPages = Math.ceil(total / ITEMS_PER_PAGE);

    // Check if user has admin/manager privileges
    const canManageDocuments = role === "admin" || role === "manager";

    // Fetch documents and role on mount
    useEffect(() => {
        const userRole = localStorage.getItem("role");
        setRole(userRole);
    }, []);

    // Fetch documents when page changes
    useEffect(() => {
        fetchDocuments();
    }, [currentPage]);

    const fetchDocuments = async () => {
        try {
            setIsLoading(true);
            const skip = (currentPage - 1) * ITEMS_PER_PAGE;
            const response = await documentApiRequest.getList({
                skip,
                limit: ITEMS_PER_PAGE,
            });
            setDocuments(response.payload.documents || []);
            setTotal(response.payload.total || 0);
        } catch (error: any) {
            toast.error(error?.payload?.message || "Không thể tải danh sách tài liệu");
            setDocuments([]);
        } finally {
            setIsLoading(false);
        }
    };

    const handleDelete = (id: number, title: string) => {
        // Block delete for non-admin/manager
        if (!canManageDocuments) {
            toast.error("Bạn không có quyền xóa tài liệu");
            return;
        }

        if (!confirm(`Bạn có chắc chắn muốn xóa "${title}"?`)) {
            return;
        }

        startTransition(async () => {
            try {
                await documentApiRequest.delete(id);
                toast.success("Xóa tài liệu thành công!");
                // Refetch to update list
                await fetchDocuments();
            } catch (error: any) {
                toast.error(error?.payload?.message || "Không thể xóa tài liệu");
            }
        });
    };

    const handleRowClick = (id: number) => {
        router.push(`/document/${id}`);
    };

    const handlePageChange = (page: number) => {
        if (page >= 1 && page <= totalPages) {
            setCurrentPage(page);
        }
    };

    return (
        <div className="container py-6">
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Quản lý Tài liệu</h1>
                    <p className="text-gray-500 mt-1">
                        Quản lý các tài liệu trong hệ thống
                    </p>
                </div>
                {canManageDocuments && (
                    <Button asChild>
                        <Link href="/document/add">
                            <Plus className="w-4 h-4 mr-2" />
                            Thêm Tài liệu
                        </Link>
                    </Button>
                )}
            </div>

            {/* Table Card */}
            <Card>
                <CardHeader className="border-b">
                    <CardTitle className="text-lg flex items-center gap-2">
                        <FileText className="w-5 h-5" />
                        Danh sách Tài liệu
                        {total > 0 && (
                            <span className="text-sm font-normal text-gray-500">
                                ({total} tài liệu)
                            </span>
                        )}
                    </CardTitle>
                </CardHeader>
                <CardContent className="p-0">
                    {isLoading ? (
                        <div className="flex items-center justify-center py-12">
                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
                        </div>
                    ) : documents.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-12 text-gray-500">
                            <FileText className="w-12 h-12 mb-4 opacity-50" />
                            <p>Chưa có tài liệu nào</p>
                            {canManageDocuments && (
                                <Button asChild variant="link" className="mt-2">
                                    <Link href="/document/add">Thêm tài liệu đầu tiên</Link>
                                </Button>
                            )}
                        </div>
                    ) : (
                        <>
                            <div className="overflow-x-auto">
                                <table className="w-full">
                                    <thead>
                                        <tr className="border-b bg-gray-50">
                                            <th className="text-left py-3 px-4 font-medium text-gray-600">
                                                Tiêu đề
                                            </th>
                                            <th className="text-left py-3 px-4 font-medium text-gray-600">
                                                Loại
                                            </th>
                                            <th className="text-left py-3 px-4 font-medium text-gray-600">
                                                Năm học
                                            </th>
                                            <th className="text-right py-3 px-4 font-medium text-gray-600">
                                                Thao tác
                                            </th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {documents.map((doc) => (
                                            <tr
                                                key={doc.id}
                                                className="border-b last:border-b-0 hover:bg-gray-50 transition-colors cursor-pointer"
                                                onClick={() => handleRowClick(doc.id)}
                                            >
                                                <td className="py-3 px-4">
                                                    <span className="font-medium text-gray-900">
                                                        {doc.title}
                                                    </span>
                                                </td>
                                                <td className="py-3 px-4">
                                                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                                                        {typeLabels[doc.type] || doc.type}
                                                    </span>
                                                </td>
                                                <td className="py-3 px-4 text-gray-600">
                                                    {doc.academic_year}
                                                </td>
                                                <td className="py-3 px-4 text-right">
                                                    <div className="flex items-center justify-end gap-2" onClick={(e) => e.stopPropagation()}>
                                                        {canManageDocuments && (
                                                            <>
                                                                <Button
                                                                    variant="ghost"
                                                                    size="sm"
                                                                    onClick={() => router.push(`/document/update/${doc.id}`)}
                                                                    className="text-amber-600 hover:text-amber-700 hover:bg-amber-50"
                                                                    title="Chỉnh sửa"
                                                                >
                                                                    <Pencil className="w-4 h-4" />
                                                                </Button>
                                                                <Button
                                                                    variant="ghost"
                                                                    size="sm"
                                                                    onClick={() => handleDelete(doc.id, doc.title)}
                                                                    disabled={isPending}
                                                                    className="text-red-600 hover:text-red-700 hover:bg-red-50"
                                                                    title="Xóa"
                                                                >
                                                                    <Trash2 className="w-4 h-4" />
                                                                </Button>
                                                            </>
                                                        )}
                                                    </div>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>

                            {/* Pagination */}
                            {totalPages > 1 && (
                                <div className="flex items-center justify-between px-4 py-3 border-t">
                                    <p className="text-sm text-gray-500">
                                        Trang {currentPage} / {totalPages}
                                    </p>
                                    <Pagination>
                                        <PaginationContent>
                                            <PaginationItem>
                                                <PaginationPrevious
                                                    onClick={() => handlePageChange(currentPage - 1)}
                                                    className={currentPage === 1 ? "pointer-events-none opacity-50" : "cursor-pointer"}
                                                />
                                            </PaginationItem>
                                            {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                                                let pageNum: number;
                                                if (totalPages <= 5) {
                                                    pageNum = i + 1;
                                                } else if (currentPage <= 3) {
                                                    pageNum = i + 1;
                                                } else if (currentPage >= totalPages - 2) {
                                                    pageNum = totalPages - 4 + i;
                                                } else {
                                                    pageNum = currentPage - 2 + i;
                                                }
                                                return (
                                                    <PaginationItem key={pageNum}>
                                                        <PaginationLink
                                                            onClick={() => handlePageChange(pageNum)}
                                                            isActive={currentPage === pageNum}
                                                            className="cursor-pointer"
                                                        >
                                                            {pageNum}
                                                        </PaginationLink>
                                                    </PaginationItem>
                                                );
                                            })}
                                            <PaginationItem>
                                                <PaginationNext
                                                    onClick={() => handlePageChange(currentPage + 1)}
                                                    className={currentPage === totalPages ? "pointer-events-none opacity-50" : "cursor-pointer"}
                                                />
                                            </PaginationItem>
                                        </PaginationContent>
                                    </Pagination>
                                </div>
                            )}
                        </>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}
