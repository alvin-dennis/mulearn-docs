import type { CollectionConfig } from "payload";

export const Users: CollectionConfig = {
  slug: "users",
  admin: {
    useAsTitle: "name",
  },
  auth: true,
  access: {
    // Only owner and admins can access the admin panel
    admin: ({ req: { user } }) => {
      return Boolean(user?.role === "owner" || user?.role === "admin");
    },
    // All authenticated users can read user data
    read: ({ req: { user } }) => {
      return Boolean(user);
    },
    // Owner can create any user, admins can only create normal users
    create: ({ req: { user } }) => {
      if (user?.role === "owner") return true;
      if (user?.role === "admin") return true;
      return false;
    },
    // Owner can update any user, admins can update normal users, users can update themselves
    update: ({ req: { user }, id }) => {
      if (user?.role === "owner") return true;
      if (user?.role === "admin") {
        return { role: { equals: "user" } };
      }
      return user?.id === id;
    },
    // Owner can delete any user except themselves, admins cannot delete
    delete: ({ req: { user }, id }) => {
      if (user?.role === "owner") return user.id !== id;
      return false;
    },
  },
  hooks: {
    beforeOperation: [
      async ({ args, operation }) => {
        if (operation !== "create" || !args.req) return;
        const { data } = args;
        const payload = args.req.payload;

        // First user becomes owner.
        const { totalDocs } = await payload.count({ collection: "users" });
        if (totalDocs === 0 && data) {
          data.role = "owner";
        } else if (data && !data.role) {
          data.role = "user";
        }

        // Admins can only create users with the 'user' role.
        const currentUser = args.req.user;
        if (currentUser?.role === "admin" && data?.role && data.role !== "user") {
          throw new Error("Admins can only create users with 'user' role");
        }
      },
    ],
  },
  fields: [
    { name: "name", type: "text", required: true },
    { name: "email", type: "email", required: true, unique: true },
    {
      name: "role",
      type: "select",
      required: true,
      defaultValue: "user",
      options: [
        { label: "Owner", value: "owner" },
        { label: "Admin", value: "admin" },
        { label: "User", value: "user" },
      ],
      access: {
        create: ({ req: { user } }) => user?.role === "owner",
        update: ({ req: { user } }) => user?.role === "owner",
        read: () => true,
      },
      admin: {
        condition: (_data, _siblingData, { user }) => user?.role === "owner",
        description:
          "Owner: Full system access. Admin: Can create users and content. User: Read-only access.",
      },
    },
  ],
};
