---
name: Drizzle inArray for array WHERE clauses
description: The sql.join approach for dynamic array WHERE clauses fails with node-postgres driver; always use inArray()
---

**Rule:** When filtering by a dynamic array of IDs in Drizzle ORM with node-postgres, always use `inArray(col, ids)` from `drizzle-orm`.

**Why:** The `sql\`${col} = ANY(ARRAY[${sql.join(ids.map(id => sql\`${id}\`), sql\`, \`)}])\`` pattern fails at runtime with node-postgres — the parameterized ARRAY syntax is not supported. The error manifests as `Failed query: ... WHERE col = ANY(ARRAY[$1, $2, ...])`.

**How to apply:**
```typescript
import { inArray } from "drizzle-orm";
// CORRECT:
const cats = ids.length
  ? await db.select().from(table).where(inArray(table.id, ids))
  : [];
// WRONG - fails with node-postgres:
// await db.select().from(table).where(sql`${table.id} = ANY(ARRAY[${sql.join(...)}])`)
```

Guard against empty arrays since `inArray(col, [])` may produce invalid SQL.
