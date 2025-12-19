## UI/UX

- Sidebar
  - Add data source form with open file dialog
  - Data source stats (they're schema-less, at least for now)\
  - Resizable
- Main window
  - Drag-n-Drop tabs
  - Use codemirror for SQL editor
  - Markdown output view
- Tutorial pop-up
- Queries sidebar should scroll
- No need for data source drop down
- Create new `select * from ...` query when clicking on a data source
-

## DB stuff

- Set up DuckDB with the markdown function and "rehydrating" from IndexedDB (idb package?)
- Load tables into the DB, maintaining a map of table names
- Use codemirror to provide autocomplete for the tables

## Questions

- What's the best way to represent the data sources in the codemirror edito? `<table name>`, or maybe `@table-name`?
-
