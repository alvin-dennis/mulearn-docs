import type { Block } from "payload";

export const Callout: Block = {
  slug: "callout",
  interfaceName: "CalloutBlock",
  labels: { singular: "Callout", plural: "Callouts" },
  fields: [
    {
      name: "type",
      type: "select",
      required: true,
      defaultValue: "info",
      options: [
        { label: "Info", value: "info" },
        { label: "Warn", value: "warn" },
        { label: "Danger", value: "danger" },
        { label: "Success", value: "success" },
      ],
    },
    {
      name: "text",
      type: "richText",
      required: true,
    },
  ],
};
