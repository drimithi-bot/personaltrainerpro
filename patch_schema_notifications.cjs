const fs = require('fs');
let code = fs.readFileSync('src/db/schema.ts', 'utf8');

const newTable = `
export const notifications = pgTable('notifications', {
  id: serial('id').primaryKey(),
  tenantId: integer('tenant_id').references(() => tenants.id).notNull(),
  title: text('title').notNull(),
  message: text('message').notNull(),
  read: boolean('read').default(false),
  type: text('type').default('INFO'),
  relatedId: integer('related_id'),
  createdAt: timestamp('created_at').defaultNow(),
});
`;

if (!code.includes('export const notifications')) {
  code += newTable;
  fs.writeFileSync('src/db/schema.ts', code);
}
