import { z } from "zod";

export const InsertRequestSchema = z.object({
  doc_type: z.string(),
  source_name: z.string(),
  source_url: z.string(),
  title: z.string(),
  slug: z.string(),
  sections: z.array(
    z.object({
      title: z.string(),
      content: z.string(),
      sub_sections: z.array(
        z.object({
          title: z.string(),
          content: z.string(),
        })
      ).optional(),
    })
  ),
  metadata: z.object({
    faculty: z.string(),
    major: z.string(),
    degree: z.string(),
    phase: z.string(),
    semester: z.number(),
    total_credits: z.number(),
    min_credits_to_graduate: z.number(),
  }),
});

// Inferred Type
export type InsertRequest = z.infer<typeof InsertRequestSchema>;
