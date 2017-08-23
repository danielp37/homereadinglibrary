db.books.createIndex({"isbn" : 1}, {unique : true});
db.books.createIndex({"bookCopies.barCode" : 1}, {"sparse" : true, "unique" : true });