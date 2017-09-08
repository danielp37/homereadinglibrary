db.books.createIndex({"isbn" : 1}, {"name" : "UIDX_Books_Isbn", "unique" : true});
db.books.createIndex({"bookCopies.barCode" : 1}, {"name" : "UIDX_Books_BookCopies_BarCode", "sparse" : true, "unique" : true });
db.classes.createIndex({ "students.barCode" : 1}, {"name" : "UIDX_Classes_Student_BarCode", "sparse" : true, "unique" : true });
db.currentreservations.createIndex({ "bookCopyBarCode": 1}, {"name" : "FIDX_BookCopyReservations_BookCopyBarCode", 
    "partialFilterExpression" : { "checkedInDate" : null }})
db.currentreservations.createIndex({ "studentBarCode": 1}, {"name" : "IDX_BookCopyReservations_StudentBarCode",
    "partialFilterExpression" : { "checkedInDate" : null }})
db.currentreservations.createIndex({ "checkedInDate": 1}, {"name" : "FIDX_BookCopyReservations_CheckedInDate_Null",
    "partialFilterExpression" : { "checkedInDate" : null }})