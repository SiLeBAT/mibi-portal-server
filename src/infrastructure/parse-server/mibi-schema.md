# MiBi-Portal database schema

`mibi-schema.json` in this folder is the single source of truth for the MiBi-Portal database schema. It is applied with the [Parse Defined Schema](https://docs.parseplatform.org/defined-schema/guide/) mechanism:

- **Classes:** which classes (MongoDB collections) exist.
- **Fields:** the fields of each class, with type, `required` and `defaultValue`.
- **Class Level Permissions (CLPs):** who may read and change each class.
- **Indexes:** non-unique indexes only.

Schema changes are made in this file and **not** in the Parse Dashboard.

## How the schema is applied

`index.ts` passes the file to `new ParseServer()` as `schema.definitions`. On every start of the server, `ParseServer.start()` runs these steps in order:

1. Parse initialises the database and creates its own system indexes (e.g. on `_User`).
2. **Schema migration:** Parse compares every class in `mibi-schema.json` with the database and adjusts the database according to the options below. The log shows `Running Migrations` and `Running Migrations Completed`.
3. The cloud code (mibi-parse-cloud) is loaded. Every class therefore exists before any cloud module runs.
4. The MiBi server registers the Parse entity subclasses (`persistence/data-store/parse/entities`) and creates the unique indexes (`persistence/data-store/parse/unique-indexes.ts`).

If the migration fails while `NODE_ENV=production`, Parse exits the process (`process.exit(1)`) and pm2 restarts it. The same happens if the database schema cannot be read within 20 seconds. In other environments the error is only logged.

## Current configuration

The options are set in `DEFAULT_SCHEMA_OPTIONS` in `index.ts`:

| Option | Value | Meaning |
|---|---|---|
| `strict` | `false` | Differences between file and database are not logged. |
| `lockSchemas` | `false` | The schema can still be changed at runtime (Dashboard, master-key saves). |
| `deleteExtraFields` | `false` | Fields that exist in the database but not in the file are **not** deleted. |
| `recreateModifiedFields` | `false` | Fields whose type differs from the file are **not** recreated. |
| `keepUnknownIndexes` | `true` | Indexes that exist in the database but not in the file are **not** deleted. |

This configuration is deliberately conservative: **the migration never deletes anything.**

An environment can override single options in its config file (e.g. `config/local.json` or environment-configs) without changing the code. The definitions themselves always come from `mibi-schema.json`:

```json
"parseServer": {
    "schema": { "strict": true }
}
```

## How the database behaves today

| Change in `mibi-schema.json` | Result in the database after restart |
|---|---|
| New class added | The class is created with its fields, CLPs and indexes. |
| New field added | The field is added to the class. |
| Field removed | **Nothing happens.** The field and its data stay in the database. |
| Field type changed (e.g. String → Number) | **Nothing happens.** The field keeps its old type. |
| `required` or `defaultValue` changed | The field options are updated. |
| CLPs changed | The CLPs are updated. |
| New index added | The index is created. |
| Index removed | **Nothing happens.** The index stays in the database. |
| Index changed (same name, other keys) | The index is recreated with the new keys. |
| Class removed | **Nothing happens.** The class and its data stay in the database. |

Also note:

- **The file always wins for CLPs.** CLP changes made in the Parse Dashboard are reset to the file on the next start.
- **`addField` is always set to `{}`.** Parse sets this on every class, whatever the file says. Clients without the master key can never add fields. Zomo_Plan, for example, has `addField: {"*": true, ...}` in the file, but the database gets `{}`.
- **Classes that are not in the file** are not deleted, but Parse sets their `addField` CLP to `{}` as well.
- **The server itself can still add fields.** A save with the master key quietly adds an unknown field, because `lockSchemas` is `false`. Such a field is then missing from the file until somebody adds it.

## How to make typical changes

### Add a field or a class

Add it to `mibi-schema.json` and restart the server.

### Remove a field

1. Remove the field from `mibi-schema.json`.
2. Delete the field in the Parse Dashboard (class → column → delete). This also deletes the data of this field in all rows.

If you skip step 2, the field and its data stay in the database, and the file and the database drift apart.

### Change the type of a field

1. Change the type in `mibi-schema.json`.
2. Delete the field in the Parse Dashboard. This deletes its data.
3. Restart the server. Parse creates the field again with the new type.

If the existing data must be kept, migrate it first (e.g. copy it into a new field with the new type) and remove the old field afterwards.

### Change `required` or `defaultValue`

Change it in `mibi-schema.json` and restart. Note: a `defaultValue` only applies to rows created after the change. Existing rows without a value are not filled in.

### Change CLPs

Change them in `mibi-schema.json` and restart. Never change CLPs only in the Dashboard: the next start resets them.

### Add an index

Add it under `indexes` of the class, e.g. `"plz_index": { "plz": 1 }`. The indexed field must be defined in `fields` of the same class, otherwise the migration fails with `Field ... does not exist, cannot add index`.

**Unique indexes cannot be defined here.** The Parse index format has no `unique` option. Unique indexes are created in `persistence/data-store/parse/unique-indexes.ts` (currently `users.email_idx` and `users.sub_idx`). Never add an index with the same name to `mibi-schema.json`: on a fresh database Parse would create it as non-unique first, and the later unique index would then fail.

## What is deliberately not in the file

The file was created from a Parse Dashboard export of the current database schema. These entries were removed:

- **Default fields** `objectId`, `createdAt`, `updatedAt` and `ACL`, and the `_id_` index. Parse manages them itself.
- **Parse's own `_User` and `_Role` indexes** (`username_1`, `email_1`, `case_insensitive_*`, `_email_verify_token`, `_perishable_token`, `_auth_data_anonymous_id`, `name_1`). Parse creates them itself. `_auth_data_anonymous_id` would also break the migration on a fresh database, because its field is not defined.
- **`users.email_idx`.** It is a unique index; see above.

## Known gaps

- **Fields written by the code but missing in the file.** The code writes these fields, which the dashboard export did not contain:
  - `_User.keycloakSub` and `_User.instituteId`
  - `users.sub` and `users.instituteId`

  With the current options this does no harm: the server adds them at runtime with a master-key save. They must be added to the file before `deleteExtraFields` or `lockSchemas` is switched on.
- **Two indexes are unique in the database but not in the file:** `analysisprocedures.key_idx` and `dbversioninfos.dbName_idx`. On a fresh database they would be created as non-unique. Both classes are no longer used.

## Possible future configuration

To make the file a strict single source of truth, where the database always matches the file exactly, these options can be switched on:

| Option | Effect when `true` | Risk |
|---|---|---|
| `strict` | Every difference between file and database is logged as a warning: extra fields, type differences, extra classes. | None. It only logs. |
| `lockSchemas` | Any schema change at runtime is rejected. A save with an unknown field fails with an error instead of quietly adding the field. | Code that writes a field missing from the file breaks. |
| `deleteExtraFields` | Fields that are not in the file are deleted from the database, **including their data in every row** (`$unset`). | Data loss, which can't be undone. Parse recommends it only for development. |
| `recreateModifiedFields` | Fields whose type differs from the file are deleted and created again with the new type, **losing their data**. | Data loss, which can't be undone. Parse recommends it only for development. |
| `keepUnknownIndexes: false` | Indexes that are not in the file are deleted. | The unique indexes from `unique-indexes.ts` and any index created by hand would be dropped. Not recommended while unique indexes are created outside the file. |

Classes are never deleted, whatever the options are.

Recommended order for switching to strict mode:

1. Add the missing fields from "Known gaps" to `mibi-schema.json`.
2. Compare the file with the schema of QA and production (`GET /schemas` with the master key, or the `_SCHEMA` collection) and fix every difference.
3. In development, switch on `strict`, `lockSchemas` and `deleteExtraFields` via `config/local.json` and test the whole application. Errors from `lockSchemas` show fields that are still missing in the file.
4. On QA and production, first switch on only `strict`. Check the log for warnings after every deployment.
5. Once the log is clean, switch on `lockSchemas`, and finally `deleteExtraFields`. Make a database backup before the first start with `deleteExtraFields`.

## Tests

`__tests__/mibi-schema.spec.ts` checks the file for:

- duplicate classes;
- missing CLPs;
- pointers and relations to classes that are not defined;
- indexes on fields that are not defined.

The last two would break the migration on a fresh database.
