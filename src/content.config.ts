import { defineCollection } from 'astro:content';
import { z } from 'astro/zod';
import { glob } from 'astro/loaders';

const research = defineCollection({
  loader: glob({pattern:'**/*.md',base:'./src/content/research'}),
  schema: z.object({title:z.string(),description:z.string(),status:z.enum(['方法设计','建设方向','研究框架']),updated:z.coerce.date(),author:z.string().default('林奥杰'),public:z.literal(true)}),
});
export const collections = {research};
