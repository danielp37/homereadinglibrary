export interface StudentStatistics {
    firstName: string;
    lastName: string;
    totalBooksCheckedOut: number;
    firstCheckOut: Date;
    lastCheckOut: Date;
    totalWeeks: number;
    averageCheckOutsPerWeek: number;
    checkOutsInLastMonth: number;
    checkOutsInPreviousMonth: number;
    daysSinceLastCheckOut: number;
    startingLevel: string;
    currentLevel: string;
}
