export interface StudentStatistics {
    firstName: String;
    lastName: String;
    totalBooksCheckedOut: Number;
    firstCheckOut: Date;
    lastCheckOut: Date;
    totalWeeks: Number;
    averageCheckOutsPerWeek: Number;
    checkOutsInLastMonth: Number;
    checkOutsInPreviousMonth: Number;
    daysSinceLastCheckOut: Number;
    startingLevel: String;
    currentLevel: String;
}
