import type { Block } from "payload";
import { Card } from "./Card";

export const CardGrid: Block = {
  slug: "cardGrid",
  interfaceName: "CardGridBlock",
  labels: { singular: "Card Grid", plural: "Card Grids" },
  fields: [
    {
      name: "columns",
      type: "select",
      required: true,
      defaultValue: "2",
      options: [
        { label: "2 columns", value: "2" },
        { label: "3 columns", value: "3" },
      ],
    },
    {
      name: "cards",
      type: "blocks",
      minRows: 2,
      maxRows: 6,
      blocks: [Card],
    },
  ],
};
