import type { Block } from "payload";
import { linkField } from "./fields/linkField";

export const Card: Block = {
  slug: "card",
  interfaceName: "CardBlock",
  labels: { singular: "Card", plural: "Cards" },
  fields: [
    { name: "title", type: "text", required: true },
    {
      name: "description",
      type: "textarea",
      admin: { description: "1–2 sentences." },
    },
    linkField("link", true),
    {
      name: "icon",
      type: "text",
      admin: { description: "Emoji or lucide-react icon name (optional)." },
    },
  ],
};
