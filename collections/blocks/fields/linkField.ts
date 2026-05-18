import type { Field } from "payload";

export const linkField = (name = "link", required = true): Field => ({
  name,
  type: "group",
  required,
  admin: {
    description: "Internal docs page or external URL.",
  },
  fields: [
    {
      name: "type",
      type: "radio",
      defaultValue: "internal",
      required: true,
      options: [
        { label: "Internal docs page", value: "internal" },
        { label: "External URL", value: "external" },
      ],
      admin: { layout: "horizontal" },
    },
    {
      name: "doc",
      type: "relationship",
      relationTo: "docs",
      required: false,
      admin: {
        condition: (_data, siblingData) => siblingData?.type === "internal",
      },
    },
    {
      name: "url",
      type: "text",
      required: false,
      admin: {
        condition: (_data, siblingData) => siblingData?.type === "external",
        placeholder: "https://example.com",
      },
    },
    {
      name: "newTab",
      type: "checkbox",
      defaultValue: false,
      admin: {
        condition: (_data, siblingData) => siblingData?.type === "external",
        description: "Open in new tab",
      },
    },
  ],
});
