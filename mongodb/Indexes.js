db.books.createIndex({"isbn" : 1}, {"name" : "UIDX_Books_Isbn", "unique" : true});
db.books.createIndex({"bookCopies.barCode" : 1}, {"name" : "UIDX_Books_BookCopies_BarCode", "sparse" : true, "unique" : true });
db.books.createIndex({ "students.barCode" : 1}, {"name" : "UIDX_Classes_Student_BarCode", "sparse" : true, "unique" : true });