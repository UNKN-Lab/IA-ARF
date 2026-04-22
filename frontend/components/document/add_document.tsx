"use client";

import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  NativeSelect,
  NativeSelectOption,
} from "@/components/ui/native-select";
import { Input } from "@/components/ui/input";
import React, { useTransition, useState, useCallback } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import DetailPageLayout from "@/components/document/detail-page-layout";
import { PageHeadingInside } from "@/components/document/page-heading";
import TiptapEditor from "@/components/ui/tiptap-editor";

import {
  DocumentRequestSchema,
  DocumentRequestType,
} from "@/schemaValidation/document.schema";
import documentApiRequest from "@/apiRequests/document";
import { FileDropZone } from "@/components/ui/file-drop-zone";

const AddDocument = () => {
  const [isPending, startTransition] = useTransition();
  const router = useRouter();
  const [importedContent, setImportedContent] = useState<string>("");

  const form = useForm<DocumentRequestType>({
    resolver: zodResolver(DocumentRequestSchema),
    defaultValues: {
      title: "",
      type: "program",
      academic_year: "",
      body: "",
    },
  });

  // Handle imported content from file drop zone
  const handleContentParsed = useCallback((html: string) => {
    setImportedContent(html);
    form.setValue("body", html, { shouldValidate: true });
  }, [form]);

  const onSubmit = async (values: DocumentRequestType) => {
    startTransition(async () => {
      try {
        // Map field names to match API expected format
        const payload = {
          title: values.title,
          body: `# ${values.title}\n\n${values.body}`,
          type: values.type,
          academic_year: values.academic_year,
        };

        // Mock: Print JSON payload to console
        console.log("=== MOCK INGEST PAYLOAD ===");
        console.log(JSON.stringify(payload, null, 2));
        console.log("=== END PAYLOAD ===");

        // Call mock ingest API
        const response = await documentApiRequest.create(payload);
        console.log("=== MOCK INGEST RESPONSE ===");
        console.log(JSON.stringify(response, null, 2));
        console.log("=== END RESPONSE ===");

        toast.success("Mock ingest thành công! Kiểm tra console.");
        // router.push("/document"); // Comment out for testing
      } catch (error: any) {
        console.error("=== MOCK INGEST ERROR ===");
        console.error(error);
        toast.error(error?.payload?.message || "Có lỗi xảy ra khi mock ingest");
      }
    });
  };

  return (
    <div className="container">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)}>
          <DetailPageLayout>
            <DetailPageLayout.Main>
              <PageHeadingInside
                title={"Thêm Tài liệu"}
                backUrl={"/document"}
              />
              <Card>
                <CardHeader className={"px-0 mx-6 pb-4 mb-4 border-b"}>
                  <CardTitle>Thông tin tài liệu</CardTitle>
                </CardHeader>

                <CardContent>
                  <div className="space-y-4">
                    {/* Title */}
                    <FormField
                      control={form.control}
                      name="title"
                      render={({ field }) => (
                        <FormItem
                          className={"flex flex-col md:flex-row md:gap-5"}
                        >
                          <FormLabel
                            className={"flex-shrink-0 md:w-40 md:mt-4"}
                          >
                            Tiêu đề
                          </FormLabel>
                          <div className={"space-y-2 flex-grow"}>
                            <FormControl>
                              <Input {...field} disabled={isPending} placeholder="Nhập tiêu đề tài liệu" />
                            </FormControl>
                            <FormMessage />
                          </div>
                        </FormItem>
                      )}
                    />

                    {/* Type */}
                    <FormField
                      control={form.control}
                      name="type"
                      render={({ field }) => (
                        <FormItem
                          className={"flex flex-col md:flex-row md:gap-5"}
                        >
                          <FormLabel
                            className={"flex-shrink-0 md:w-40 md:mt-4"}
                          >
                            Loại tài liệu
                          </FormLabel>
                          <div className={"space-y-2 flex-grow"}>
                            <NativeSelect
                              value={field.value}
                              onChange={(e) => field.onChange(e.target.value)}
                              disabled={isPending}
                              aria-label="Chọn loại tài liệu"
                            >
                              <NativeSelectOption value="program">
                                Chương trình đào tạo
                              </NativeSelectOption>
                              <NativeSelectOption value="syllabus">
                                Đề cương môn học
                              </NativeSelectOption>
                              <NativeSelectOption value="policy">
                                Quy định
                              </NativeSelectOption>
                            </NativeSelect>
                            <FormMessage />
                          </div>
                        </FormItem>
                      )}
                    />

                    {/* Academic Year */}
                    <FormField
                      control={form.control}
                      name="academic_year"
                      render={({ field }) => (
                        <FormItem
                          className={"flex flex-col md:flex-row md:gap-5"}
                        >
                          <FormLabel
                            className={"flex-shrink-0 md:w-40 md:mt-4"}
                          >
                            Năm học
                          </FormLabel>
                          <div className={"space-y-2 flex-grow"}>
                            <FormControl>
                              <Input
                                {...field}
                                disabled={isPending}
                                placeholder="VD: K20"
                              />
                            </FormControl>
                            <FormMessage />
                          </div>
                        </FormItem>
                      )}
                    />

                    {/* Body */}
                    <FormField
                      control={form.control}
                      name="body"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Nội dung</FormLabel>
                          <FormControl>
                            <TiptapEditor
                              className={"prose max-w-none"}
                              disabled={isPending}
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </CardContent>
              </Card>
            </DetailPageLayout.Main>
            <DetailPageLayout.Right>
              <div className={"h-20 flex gap-3 items-end justify-end"}>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => router.push("/document")}
                  disabled={isPending}
                >
                  Huỷ
                </Button>
                <Button type={"submit"} disabled={isPending}>
                  {isPending ? "Đang tạo..." : "Tạo Tài liệu"}
                </Button>
              </div>

              <Card className={"p-6 flex flex-col gap-3 w-full"}>
                <h3 className="font-medium text-sm">Import từ File</h3>
                <p className="text-sm text-muted-foreground mb-2">
                  Kéo thả hoặc chọn file để import nội dung vào editor.
                </p>
                <FileDropZone
                  onContentParsed={handleContentParsed}
                  disabled={isPending}
                />
              </Card>

              <Card className={"p-6 flex flex-col gap-3 w-full"}>
                <h3 className="font-medium text-sm">Hướng dẫn</h3>
                <p className="text-sm text-muted-foreground">
                  Điền đầy đủ thông tin và nhấn &quot;Tạo Tài liệu&quot; để thêm tài liệu mới vào hệ thống.
                </p>
              </Card>
            </DetailPageLayout.Right>
          </DetailPageLayout>
        </form>
      </Form>
    </div>
  );
};

export default AddDocument;
