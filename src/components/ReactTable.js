/** @format */

import React from "react";

import "bootstrap/dist/css/bootstrap.min.css";
import "./reactTable.css";

import BTable from "react-bootstrap/Table";
import { matchSorter } from "match-sorter";

import {
  useTable,
  useFilters,
  useGlobalFilter,
  useAsyncDebounce,
  useRowSelect,
  usePagination,
  useSortBy,
} from "react-table";

// Define a default UI for filtering
function GlobalFilter({
  preGlobalFilteredRows,
  globalFilter,
  setGlobalFilter,
}) {
  const count = preGlobalFilteredRows.length;
  const [value, setValue] = React.useState(globalFilter);
  const [trPropsState, setTrPropsState] = React.useState(null);

  const onChange = useAsyncDebounce((value) => {
    setGlobalFilter(value || undefined);
  }, 200);

  return (
    <span>
      Search:{" "}
      <input
        value={value || ""}
        onChange={(e) => {
          setValue(e.target.value);
          onChange(e.target.value);
        }}
        placeholder={`${count} records...`}
        style={{
          fontSize: "1.1rem",
          border: "0",
        }}
      />
    </span>
  );
}

function fuzzyTextFilterFn(rows, id, filterValue) {
  return matchSorter(rows, filterValue, { keys: [(row) => row.values[id]] });
}

// Define a default UI for filtering
function DefaultColumnFilter({
  column: { filterValue, preFilteredRows, setFilter },
}) {
  const count = preFilteredRows.length;

  return (
    <input
      value={filterValue || ""}
      onChange={(e) => {
        setFilter(e.target.value || undefined);

        // Set undefined to remove the filter entirely
      }}
      placeholder={`Search ${count} records...`}
    />
  );
}

export default function ReactTable({ columns, data, onHandleRowSelection }) {
  const [isActive, setActive] = React.useState(null);
  const filterTypes = React.useMemo(
    () => ({
      // Add a new fuzzyTextFilterFn filter type.
      fuzzyText: fuzzyTextFilterFn,
      // Or, override the default text filter to use
      // "startWith"
      text: (rows, id, filterValue) => {
        return rows.filter((row) => {
          const rowValue = row.values[id];
          return rowValue !== undefined
            ? String(rowValue)
                .toLowerCase()
                .startsWith(String(filterValue).toLowerCase())
            : true;
        });
      },
    }),
    []
  );

  const defaultColumn = React.useMemo(
    () => ({
      // Let's set up our default Filter UI
      Filter: DefaultColumnFilter,
    }),
    []
  );

  const {
    getTableProps,
    getTableBodyProps,
    headerGroups,
    rows,
    prepareRow,
    visibleColumns,
    preGlobalFilteredRows,
    setGlobalFilter,
    page,
    canPreviousPage,
    canNextPage,
    pageOptions,
    pageCount,
    gotoPage,
    nextPage,
    previousPage,
    setPageSize,
    state: { pageIndex, pageSize, selectedRowIds },
  } = useTable(
    {
      columns,
      data,
      defaultColumn,
      useRowSelect,
      filterTypes,
      initialState: { pageIndex: 0, hiddenColumns: ["scenarios"] },
    },

    useFilters,
    useGlobalFilter,
    useSortBy,
    usePagination
  );

  // We don't want to render all of the rows for this example, so cap
  // it for this use case
  const firstPageRows = rows.slice(0, 10);

  // Render the UI for your table
  return (
    <div>
      <div className='red'>hello </div>
      <BTable striped bordered hover size='sm' {...getTableProps()}>
        <thead>
          {headerGroups.map((headerGroup) => (
            <tr {...headerGroup.getHeaderGroupProps()}>
              {headerGroup.headers.map((column) => (
                <th>
                  <div
                    {...column.getHeaderProps(column.getSortByToggleProps())}
                    className={
                      column.isSorted
                        ? column.isSortedDesc
                          ? "border--down-sort"
                          : "border--up-sort"
                        : ""
                    }
                  >
                    <span>{column.render("Header")}</span>
                  </div>

                  <div>{column.canFilter ? column.render("Filter") : null}</div>
                </th>
              ))}
            </tr>
          ))}
          <tr></tr>
        </thead>
        <tbody {...getTableBodyProps()}>
          {page.map((row, i) => {
            prepareRow(row);
            return (
              <tr
                className={`table-row ${
                  isActive === row.getRowProps().key ? "active" : ""
                }`}
                {...row.getRowProps()}
                onClick={(e) => {
                  const featureName = row.allCells[0].value;
                  const featurePath = row.allCells[1].value;
                  const scenarioNum = row.allCells[2].value;
                  const tags = row.allCells[3].value;
                  const scenarios = row.allCells[4].value;

                  setActive(row.getRowProps().key);

                  const selectedRowObject = {
                    featureName,
                    rowProps: row.getRowProps(),
                    featurePath,
                    scenarioNum,
                    tags,
                    scenarios,
                  };
                  onHandleRowSelection(selectedRowObject);

                  console.log(
                    `on double click ${JSON.stringify(selectedRowObject)}`
                  );

                  console.log(
                    `on double click ${JSON.stringify(row.getRowProps)}`
                  );
                }}
                onDoubleClick={(e) => {
                  const featureName = row.allCells[0].value;
                  const featurePath = row.allCells[1].value;
                  const scenarioNum = row.allCells[2].value;
                  const tags = row.allCells[3].value;
                  const scenarios = row.allCells[4].value;

                  setActive(row.getRowProps().key);

                  console.log(
                    `on double click ${JSON.stringify({
                      featureName,
                      rowProps: row.getRowProps(),
                      featurePath,
                      scenarioNum,
                      tags,
                      scenarios,
                    })}`
                  );

                  console.log(
                    `on double click ${JSON.stringify(row.getRowProps)}`
                  );
                }}
              >
                {row.cells.map((cell) => {
                  return (
                    <td {...cell.getCellProps()}>{cell.render("Cell")}</td>
                  );
                })}
              </tr>
            );
          })}
        </tbody>
      </BTable>
      {/* 
        Pagination can be built however you'd like. 
        This is just a very basic UI implementation:
      */}
      <div className='pagination'>
        <button onClick={() => gotoPage(0)} disabled={!canPreviousPage}>
          {"<<"}
        </button>{" "}
        <button onClick={() => previousPage()} disabled={!canPreviousPage}>
          {"<"}
        </button>{" "}
        <button onClick={() => nextPage()} disabled={!canNextPage}>
          {">"}
        </button>{" "}
        <button onClick={() => gotoPage(pageCount - 1)} disabled={!canNextPage}>
          {">>"}
        </button>{" "}
        <span>
          Page{" "}
          <strong>
            {pageIndex + 1} of {pageOptions.length}
          </strong>{" "}
        </span>
        <span>
          | Go to page:{" "}
          <input
            type='number'
            defaultValue={pageIndex + 1}
            onChange={(e) => {
              const page = e.target.value ? Number(e.target.value) - 1 : 0;
              gotoPage(page);
            }}
            style={{ width: "100px" }}
          />
        </span>{" "}
        <select
          value={pageSize}
          onChange={(e) => {
            setPageSize(Number(e.target.value));
          }}
        >
          {[10, 20, 30, 40, 50].map((pageSize) => (
            <option key={pageSize} value={pageSize}>
              Show {pageSize}
            </option>
          ))}
        </select>
      </div>
    </div>
  );
}
