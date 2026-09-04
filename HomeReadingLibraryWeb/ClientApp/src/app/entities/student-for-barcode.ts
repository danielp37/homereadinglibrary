/**
 * A flattened view of a Student combined with their class/teacher info, used by the
 * Print Barcodes feature. Built client-side from Class[] (BaggyBookService.getClasses()) —
 * no dedicated backend endpoint is required.
 */
export interface StudentForBarcode {
  classId: string;
  teacherName: string;
  grade: number;
  firstName: string;
  lastName: string;
  barCode: string;
}
