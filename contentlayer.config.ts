import { defineDocumentType, makeSource } from "contentlayer/source-files";

export const Section = defineDocumentType(() => ({
  name: "Section",
  filePathPattern: "sections/*.mdx",
  contentType: "mdx",
  fields: {
    title: { type: "string", required: true },
    slug: { type: "string", required: true },
    order: { type: "number", required: true },
    summary: { type: "string" },
  },
}));

export default makeSource({
  contentDirPath: "content",
  documentTypes: [Section],
  disableImportAliasWarning: true,
});
