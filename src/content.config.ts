import { defineCollection, z } from 'astro:content';
import { glob } from 'astro/loaders';

const projects = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/projects' }),
  schema: z.object({
    title: z.string(),
    summary: z.string(),
    tech: z.array(z.string()).min(1),
    metric: z.string().optional(),
    image: z.string().optional(),
    demo: z.string().url().optional(),
    repo: z.string().url().optional(),
    featured: z.boolean().default(true),
    order: z.number().default(0),
  }),
});

const work = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/work' }),
  schema: z.object({
    title: z.string(),
    role: z.string(),
    period: z.string(),
    metric: z.string().optional(),
    summary: z.string(),
    tech: z.array(z.string()).default([]),
    order: z.number().default(0),
  }),
});

export const collections = { projects, work };
