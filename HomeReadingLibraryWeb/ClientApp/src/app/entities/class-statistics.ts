import { StudentStatistics } from "./student-statistics";

export interface ClassStatistics {
    firstCheckOut: Date;
    totalBooksCheckedOut: number;
    totalWeeks: number;
    averageCheckOutsPerWeek: number;
    studentStats: StudentStatistics[];
}
