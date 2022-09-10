db.currentreservations.deleteMany( { })
db.volunteerlogons.deleteMany( { })
db.volunteers.deleteMany( { "isAdmin" : false })
db.classes.deleteMany( { })

db.books.updateMany( { }, 
	{ $pull : { bookCopies : { $or : [ {isLost : true}, {isDamaged : true } ] } } }, 
	{ multi : true })
	
db.books.deleteMany( { bookCopies : {$eq : [] } })