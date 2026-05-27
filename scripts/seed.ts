import "dotenv/config";
import { getPayload } from "payload";
import config from "../payload.config";

function lexicalParagraph(text: string) {
  return {
    type: "paragraph",
    version: 1,
    indent: 0,
    children: [{ type: "text", text, version: 1 }],
  };
}

function lexicalHeading(tag: "h2" | "h3", text: string) {
  return {
    type: "heading",
    tag,
    version: 1,
    indent: 0,
    children: [{ type: "text", text, version: 1 }],
  };
}

function lexicalBulletList(items: string[]) {
  return {
    type: "list",
    listType: "bullet",
    version: 1,
    indent: 0,
    children: items.map((text) => ({
      type: "listitem",
      version: 1,
      indent: 0,
      children: [{ type: "text", text, version: 1 }],
    })),
  };
}

function lexicalNumberedList(items: string[]) {
  return {
    type: "list",
    listType: "number",
    version: 1,
    indent: 0,
    children: items.map((text) => ({
      type: "listitem",
      version: 1,
      indent: 0,
      children: [{ type: "text", text, version: 1 }],
    })),
  };
}

function lexicalDoc(children: any[]) {
  return {
    root: {
      type: "root",
      format: "" as const,
      indent: 0,
      version: 1,
      direction: "ltr" as const,
      children,
    },
  };
}

async function seed() {
  const payload = await getPayload({ config });

  const { totalDocs: userCount } = await payload.count({ collection: "users" });
  if (userCount === 0) {
    console.log("No users exist — create one through the admin first, then re-run this script.");
    process.exit(0);
  }

  const { totalDocs: existingCategories } = await payload.count({
    collection: "categories",
    where: { slug: { equals: "getting-started" } },
  });
  if (existingCategories > 0) {
    console.log("Getting Started category already exists. Skipping seed.");
    process.exit(0);
  }

  console.log("Seeding Getting Started category and docs...");

  const category = await payload.create({
    collection: "categories",
    data: {
      title: "Getting Started",
      slug: "getting-started",
      description: "Learn how to use this documentation system",
      order: 1,
    },
  });

  await payload.create({
    collection: "docs",
    data: {
      title: "Welcome",
      slug: "welcome",
      description: "Welcome to your new documentation system powered by Payload CMS and Fumadocs",
      category: category.id,
      order: 1,
      content: lexicalDoc([
        lexicalHeading("h2", "Welcome to Your Documentation System"),
        lexicalParagraph(
          "Congratulations! You've successfully set up your documentation system. This template combines the power of Payload CMS for content management with Fumadocs for beautiful documentation rendering.",
        ),
        lexicalHeading("h3", "What You Can Do"),
        lexicalBulletList([
          "Create and organize documentation in categories",
          "Manage user roles and permissions (Owner, Admin, User)",
          "Upload and manage media files (images, videos)",
          "Use the powerful Lexical rich text editor",
        ]),
        lexicalHeading("h3", "Next Steps"),
        lexicalParagraph(
          "Read through the Getting Started guide to learn how to use all the features of this system. Start by understanding the role-based access control system, then move on to creating your first category and documentation.",
        ),
      ]),
      _status: "published",
    },
  });

  await payload.create({
    collection: "docs",
    data: {
      title: "Understanding Roles",
      slug: "understanding-roles",
      description: "Learn about the different user roles and their permissions",
      category: category.id,
      order: 2,
      content: lexicalDoc([
        lexicalHeading("h2", "Role-Based Access Control"),
        lexicalParagraph("This system uses three distinct roles to manage access and permissions:"),
        lexicalHeading("h3", "Owner"),
        lexicalParagraph(
          "You are the Owner! As the first user, you have full system access including:",
        ),
        lexicalBulletList([
          "Create, update, and delete all content",
          "Manage users with any role (Owner, Admin, User)",
          "Full access to the admin panel",
        ]),
        lexicalHeading("h3", "Admin"),
        lexicalParagraph("Admins can manage content and create normal users. They can:"),
        lexicalBulletList([
          "Create and edit documentation, categories, and media",
          "Create users (but only with 'User' role)",
          "Access the admin panel",
        ]),
        lexicalHeading("h3", "User"),
        lexicalParagraph("Regular users have read-only access. They can:"),
        lexicalBulletList([
          "View all published documentation",
          "Update their own profile information",
        ]),
      ]),
      _status: "published",
    },
  });

  await payload.create({
    collection: "docs",
    data: {
      title: "Managing Content",
      slug: "managing-content",
      description: "Learn how to create and organize your documentation",
      category: category.id,
      order: 3,
      content: lexicalDoc([
        lexicalHeading("h2", "Creating Categories"),
        lexicalParagraph(
          "Categories are the main organizational structure for your documentation. Each category appears as a tab in the sidebar.",
        ),
        lexicalNumberedList([
          "Navigate to Collections > Categories in the admin panel",
          "Click 'Create New'",
          "Fill in the title, slug, and description",
          "Set the order number (lower numbers appear first)",
        ]),
        lexicalHeading("h2", "Creating Documentation Pages"),
        lexicalParagraph("Once you have categories, you can create documentation pages:"),
        lexicalNumberedList([
          "Navigate to Collections > Docs in the admin panel",
          "Click 'Create New'",
          "Fill in the title, slug, and description",
          "Select a category from the sidebar",
          "Write your content using the Lexical editor",
          "Set the order number to control position in the sidebar",
        ]),
        lexicalHeading("h2", "Nested Documentation"),
        lexicalParagraph(
          "You can create nested documentation by selecting a parent page in the sidebar when creating a new doc. This creates a hierarchy in your documentation structure.",
        ),
      ]),
      _status: "published",
    },
  });

  await payload.create({
    collection: "docs",
    data: {
      title: "Using the Editor",
      slug: "using-the-editor",
      description: "Learn how to use the Lexical rich text editor for creating content",
      category: category.id,
      order: 4,
      content: lexicalDoc([
        lexicalHeading("h2", "The Lexical Editor"),
        lexicalParagraph(
          "This system uses the Lexical rich text editor, a powerful and modern editor for creating documentation. Here are the main features:",
        ),
        lexicalHeading("h3", "Text Formatting"),
        lexicalBulletList([
          "Bold, italic, underline, and strikethrough",
          "Headings (H1 through H6)",
          "Code blocks and inline code",
        ]),
        lexicalHeading("h3", "Lists and Structure"),
        lexicalBulletList(["Bullet lists", "Numbered lists", "Block quotes"]),
        lexicalHeading("h3", "Media"),
        lexicalParagraph(
          "You can embed images and videos directly in your content. Upload media files first through the Media collection, then insert them into your documentation.",
        ),
        lexicalHeading("h3", "Tips"),
        lexicalBulletList([
          "Use headings to structure your content (helps with table of contents)",
          "Save drafts regularly using the autosave feature",
          "Use the 'Publish' button when ready to make content live",
        ]),
      ]),
      _status: "published",
    },
  });

  console.log("Seed complete.");
  process.exit(0);
}

seed().catch((err) => {
  console.error(err);
  process.exit(1);
});
