import streamlit as st
import duckdb
import tempfile


# Register a custom markdown() function in DuckDB
def markdown_func(s: str) -> str:
    if s is None:
        return None
    return f"<markdown>{s}"


@st.cache_resource  # 👈 Add the caching decorator
def con():
    con = duckdb.connect()
    con.create_function("markdown", markdown_func)
    return con


DEFAULT_QUERIES = [
    {"name": "Select All", "query": "SELECT * FROM $data"},
    {"name": "Count", "query": "SELECT COUNT(*) FROM $data"},
    {
        "name": "Render Resolved Issues Markdown from Rayon Dataset",
        "query": """
SELECT markdown('# ' || item.title), markdown(item.body) AS rendered
FROM $data, UNNEST(resolved_issues) AS t(item);
""".strip(),
    },
]


def init_session():
    if "sentinel" not in st.session_state:
        st.session_state.sentinel = True

        st.session_state.data_sources = []

        # Initialize session state for saved queries
        st.session_state.queries = DEFAULT_QUERIES

        # Add default dataset
        add_data_source_from_file(
            "rayon-rs__rayon_dataset.jsonl",
            "example/rayon-rs__rayon_dataset.jsonl",
        )


def get_next_table_name(base="table"):
    existing = set(row[0] for row in con().execute("SHOW TABLES").fetchall())
    i = 1
    while f"{base}_{i}" in existing:
        i += 1
    return f"{base}_{i}"


def get_next_pasted_entry_name():
    if "pasted_entry_count" not in st.session_state:
        st.session_state.pasted_entry_count = 0
    st.session_state.pasted_entry_count += 1
    return f"Pasted Entry {st.session_state.pasted_entry_count}"


def add_data_source_from_file(name: str, file_path: str):
    """Helper to add a data source directly from a JSONL file path."""
    table_name = get_next_table_name()
    con().execute(
        f"CREATE TABLE {table_name} AS SELECT * FROM read_json_auto('{file_path}')"
    )
    st.session_state.data_sources.append(
        {"name": name, "path": file_path, "table_name": table_name}
    )


def add_data_source_from_text(name: str, data: str):
    """Helper to add a data source from JSONL text content."""
    with tempfile.NamedTemporaryFile(mode="w+", suffix=".jsonl", delete=False) as tmp:
        tmp.write(data)
        tmp_path = tmp.name
    add_data_source_from_file(name, tmp_path)


@st.dialog("➕ Add Data Source")
def add_data_source():
    tab_upload, tab_paste = st.tabs(["📁 Upload File", "📝 Paste Content"])

    with tab_upload:
        new_files = st.file_uploader(
            "Upload JSON(L) files",
            type=["jsonl", "json"],
            accept_multiple_files=True,
            key="dialog_file_uploader",
        )

    with tab_paste:
        source_name = st.text_input("Data Source Name", key="dialog_source_name")
        new_paste = st.text_area(
            "Paste JSONL content", height=150, key="dialog_paste_area"
        )

    try_add = False
    records_to_add = []

    with st.container(horizontal=True):
        if st.button("Add"):
            # Get sources to add
            try_add = True

            if "new_files" in locals() and new_files:
                for f in new_files:
                    records_to_add.append(
                        {"name": f.name, "data": f.getvalue().decode("utf-8")}
                    )
            if "new_paste" in locals() and new_paste.strip():
                name = source_name.strip()
                if not name:
                    name = get_next_pasted_entry_name()
                records_to_add.append({"name": name, "data": new_paste.strip()})

        if st.button("Cancel"):
            st.rerun()

    # Insert new sources into database
    for record in records_to_add:
        add_data_source_from_text(record["name"], record["data"])

    if records_to_add:
        st.success("Data source(s) added successfully!")
        st.rerun()
    elif try_add:
        st.warning("Please upload a file or paste JSON content before adding.")


@st.cache_data
def make_query(query: str, table_name: str) -> str:
    query_to_run = query.replace("$data", table_name)
    try:
        df = con().execute(query_to_run).df()
        return df
    except Exception as e:
        return e


def render_df(df):
    st.write(f"Returned {len(df)} rows.")

    # Render Markdown fields
    for i, row in df.iterrows():
        with st.expander(f"Row {i + 1}"):
            for col in df.columns:
                value = row[col]
                if isinstance(value, str):
                    if value.startswith("<markdown>"):
                        st.markdown(value.split("<markdown>")[1])
                    elif len(value.splitlines()) > 1:
                        st.write(f"**{col}:**")
                        st.markdown("```\n" + value + "\n```")
                    else:
                        st.write(f"**{col}:** `", value, "`")
                elif isinstance(value, list) or isinstance(value, dict):
                    st.write(f"**{col}:** ", value)
                else:
                    st.write(f"**{col}:** ", value)


def main():
    st.set_page_config(page_title="Ad Hoc Lens", layout="wide")

    st.sidebar.header("📂 Data Sources")

    if st.sidebar.button("Add Data Source"):
        add_data_source()

    if not st.session_state.data_sources:
        st.info("Please upload a data source to begin.")
        return

    labels = [entry["name"] for entry in st.session_state.data_sources]
    selected_label = st.sidebar.radio("Select a data source to explore", labels)
    selected_entry = next(
        item for item in st.session_state.data_sources if item["name"] == selected_label
    )
    table_name = selected_entry["table_name"]

    st.sidebar.subheader("💾 Saved Queries")
    query_names = [q["name"] for q in st.session_state.queries]
    selected_query_name = st.sidebar.radio("Select a query", query_names)
    selected_query = next(
        q for q in st.session_state.queries if q["name"] == selected_query_name
    )

    query = st.text_area("SQL Query", selected_query["query"], height=150)

    new_query_name = st.text_input(
        "Save current query as",
        key="new_query_name_" + selected_query_name,
        value=selected_query_name,
    )
    if st.button("Save Query"):
        if new_query_name.strip():
            st.session_state.queries.append(
                {"name": new_query_name.strip(), "query": query}
            )
            st.success(f"Query '{new_query_name.strip()}' saved successfully!")
            st.rerun()
        else:
            st.warning("Please enter a name before saving.")

    # Only run the query when the button is clicked
    if st.button("Run Query"):
        res = make_query(query, table_name)

        if isinstance(res, Exception):
            st.error(res)
        else:
            df = res
            render_df(df)


if __name__ == "__main__":
    init_session()
    main()
