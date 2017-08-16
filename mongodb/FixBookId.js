db.books.find().forEach(function(doc) { doc._id = new ObjectId().str; db.new_books.insert(doc); });
db.new_books.createIndex({"bookCopies.barCode" : 1}, {"sparse" : true, "unique" : true })
db.books.drop()
db.new_books.renameCollection('books')