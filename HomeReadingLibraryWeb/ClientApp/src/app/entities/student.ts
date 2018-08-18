export class Student {
    firstName: string;
    lastName: string;
    barCode?: string;

    public static fromObject(studentObj: any): Student {
        const student = new Student();
        Object.assign(student, studentObj);

        return student;
    }
}
