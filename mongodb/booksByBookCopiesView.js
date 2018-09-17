db.getCollection("books").aggregate(

	// Pipeline
	[
		// Stage 1
		{
			$unwind: { "path" : "$bookCopies", "preserveNullAndEmptyArrays" : true }
		},

		// Stage 2
		{
			$project: { "_id" : "$bookCopies.barCode", 
			  "title" : 1.0, 
			  "author" : 1.0, 
			  "guidedReadingLevel" : 1.0, 
			  "boxNumber" : 1.0, 
			  "bookId" : "$_id", 
			  "isLost" : "$bookCopies.isLost",
			  "lostDate" : "$bookCopies.lostDate",
			  "isDamaged" : "$bookCopies.isDamaged",
			  "damagedDate" : "$bookCopies.damagedDate",
			  "comments" : "$bookCopies.comments" }
		},

	]

	// Created with Studio 3T, the IDE for MongoDB - https://studio3t.com/

);
