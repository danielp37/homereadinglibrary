import { StudentStatistics } from "./student-statistics";

export interface ClassStatistics {
    firstCheckOut: Date;
    totalBooksCheckedOut: Number;
    totalWeeks: Number;
    averageCheckOutsPerWeek: Number;
    studentStats: StudentStatistics[];
}
