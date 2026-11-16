# MiBi-Portal Server

The MiBi-Portal Server

Soon to be deprecated

## Database schema

The Parse DB schema is defined in `src/infrastructure/parse-server/mibi-schema.json` and applied by Parse Server on start ([Defined Schema](https://docs.parseplatform.org/defined-schema/guide/)). Schema and CLP changes belong in this file, not in the Parse Dashboard: CLPs are reset to the file on every start. See [mibi-schema.md](src/infrastructure/parse-server/mibi-schema.md) for how the schema and the database behave and how to make changes.
