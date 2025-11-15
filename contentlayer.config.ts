import { defineDocumentType, makeSource } from "contentlayer/source-files";

export const Section = defineDocumentType(() => ({
  name: "Section",
  filePathPattern: "*/sections/*.mdx",
  contentType: "mdx",
  fields: {
    title: { type: "string", required: true },
    slug: { type: "string", required: true },
    order: { type: "number", required: true },
    summary: { type: "string" },
  },
  computedFields: {
    slug: {
      type: "string",
      resolve: (doc) => doc._raw.flattenedPath.split('/').slice(1).join('/'), // Adjusted slug resolution
    },
    locale: {
      type: "string",
      resolve: (doc) => doc._raw.flattenedPath.split('/')[0], // Extract locale from path
    },
  },
}));

export default makeSource({
  contentDirPath: "content",
  documentTypes: [Section],
  disableImportAliasWarning: true,
});
