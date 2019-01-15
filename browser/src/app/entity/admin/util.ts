import { FilterMetadata } from 'primeng/api';

/**
 * PrimeNG external filters factory
 * @returns external filter for dataTable
 */
export function dataTableFilter(key: string, value: string): { [key: string]: FilterMetadata } {
  if (!value) {
    return {};
  } else {
    return {[key]: {value: value}};
  }
}
