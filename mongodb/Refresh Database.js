db.currentreservations.deleteMany( { })
db.volunteerlogons.deleteMany( { })
db.volunteers.deleteMany( { "isAdmin" : false })
db.classes.deleteMany( { })

db.books.update( { }, 
	{ $pull : { bookCopies : { $or : [ {isLost : true}, {isDamaged : true } ] } } }, 
	{ multi : true })
	
db.books.deleteMany( { bookCopies : {$eq : [] } })