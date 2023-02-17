export class Student {
    firstName: string;
    lastName: string;
    barCode?: string;

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    public static fromObject(studentObj: any): Student {
        const student = new Student();
        Object.assign(student, studentObj);

        return student;
    }
}
