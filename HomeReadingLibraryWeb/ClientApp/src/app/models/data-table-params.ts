/**
 * DataTableParams interface replaces the removed angular-2-data-table dependency.
 * Used for pagination and sorting in datatables.
 */
export interface DataTableParams {
  offset?: number;
  limit?: number;
  sortBy?: string;
  sortAsc?: boolean;
}
