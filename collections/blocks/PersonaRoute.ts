import type { Block } from "payload";
import { linkField } from "./fields/linkField";

export const PersonaRoute: Block = {
  slug: "personaRoute",
  interfaceName: "PersonaRouteBlock",
  labels: { singular: "Persona Route", plural: "Persona Routes" },
  fields: [
    {
      name: "heading",
      type: "text",
      admin: {
        description: 'Optional. Defaults to "Already know what you\'re looking for?"',
      },
    },
    {
      name: "routes",
      type: "array",
      minRows: 2,
      maxRows: 8,
      fields: [
        { name: "persona", type: "text", required: true },
        { name: "destination", type: "text", required: true },
        linkField("link", true),
      ],
    },
  ],
};
