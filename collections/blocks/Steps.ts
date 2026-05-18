import type { Block } from "payload";

export const Steps: Block = {
  slug: "steps",
  interfaceName: "StepsBlock",
  labels: { singular: "Steps", plural: "Steps" },
  fields: [
    {
      name: "steps",
      type: "array",
      minRows: 2,
      maxRows: 10,
      fields: [
        { name: "title", type: "text", required: true },
        { name: "content", type: "richText", required: true },
      ],
    },
  ],
};
