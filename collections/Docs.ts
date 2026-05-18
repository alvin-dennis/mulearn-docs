/** biome-ignore-all lint/suspicious/noExplicitAny: CollectionConfig requires any */

import {
  BlocksFeature,
  EXPERIMENTAL_TableFeature,
  lexicalEditor,
} from "@payloadcms/richtext-lexical";
import type { CollectionConfig } from "payload";
import { validateSlug } from "@/lib/utils";
import { Callout } from "./blocks/Callout";
import { Card } from "./blocks/Card";
import { CardGrid } from "./blocks/CardGrid";
import { PersonaRoute } from "./blocks/PersonaRoute";
import { Steps } from "./blocks/Steps";
import { Tabs } from "./blocks/Tabs";

export const Docs: CollectionConfig = {
  slug: "docs",
  admin: {
    useAsTitle: "title",
    defaultColumns: ["title", "category", "slug", "order", "parent", "lastEditedBy"],
  },
  access: {
    // Public read access for documentation
    read: () => true,
    // Owner and admins can create docs
    create: ({ req: { user } }) => {
      return Boolean(user?.role === "owner" || user?.role === "admin");
    },
    // Owner and admins can update docs
    update: ({ req: { user } }) => {
      return Boolean(user?.role === "owner" || user?.role === "admin");
    },
    // Owner and admins can delete docs
    delete: ({ req: { user } }) => {
      return Boolean(user?.role === "owner" || user?.role === "admin");
    },
  },
  versions: {
    drafts: {
      autosave: {
        interval: 100,
        showSaveDraftButton: true,
      },
      schedulePublish: true,
      validate: false,
    },
  },
  hooks: {
    beforeChange: [
      ({ req, data }) => {
        if (req.user) {
          data.lastEditedBy = req.user.id;
        }
        return data;
      },
    ],
  },
  fields: [
    {
      name: "title",
      type: "text",
      required: true,
      admin: {
        description: "The page title",
      },
    },
    {
      name: "slug",
      type: "text",
      required: true,
      validate: validateSlug,
      admin: {
        description: "URL-friendly identifier for this page",
      },
    },
    {
      name: "description",
      type: "textarea",
      admin: {
        description: "Brief description or excerpt for this page",
      },
    },
    {
      name: "category",
      type: "relationship",
      relationTo: "categories" as any,
      required: true,
      admin: {
        description: "The sidebar tab/category this doc belongs to",
        position: "sidebar",
      },
    },
    {
      name: "parent",
      type: "relationship",
      relationTo: "docs" as any,
      admin: {
        description: "Parent page for nested documentation structure",
        position: "sidebar",
      },
      filterOptions: ({ id }) => ({
        id: {
          not_equals: id,
        },
      }),
    },
    {
      name: "order",
      type: "number",
      required: true,
      defaultValue: 0,
      admin: {
        description: "Order within the category/parent",
        position: "sidebar",
      },
    },
    {
      name: "lastEditedBy",
      type: "relationship",
      relationTo: "users" as any,
      admin: {
        position: "sidebar",
        readOnly: true,
        description: "User who last edited this document",
      },
    },
    {
      name: "content",
      type: "richText",
      required: true,
      editor: lexicalEditor({
        features: ({ defaultFeatures }) => [
          ...defaultFeatures,
          EXPERIMENTAL_TableFeature(),
          BlocksFeature({
            blocks: [Callout, Card, CardGrid, Steps, Tabs, PersonaRoute],
          }),
        ],
      }),
      admin: {
        description: "The main content of the documentation page",
      },
    },
  ],
};
