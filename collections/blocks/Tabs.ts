import type { Block } from "payload";

export const Tabs: Block = {
  slug: "tabs",
  interfaceName: "TabsBlock",
  labels: { singular: "Tabs", plural: "Tabs" },
  fields: [
    {
      name: "items",
      type: "array",
      minRows: 2,
      maxRows: 5,
      fields: [
        { name: "label", type: "text", required: true },
        { name: "content", type: "richText", required: true },
      ],
    },
  ],
};
