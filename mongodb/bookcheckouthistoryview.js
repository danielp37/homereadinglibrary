db.currentreservations.aggregate(

	// Pipeline
	[
		// Stage 1
		{
			$lookup: { "from" : "booksByBookCopies", "localField" : "bookCopyBarCode", "foreignField" : "_id", "as" : "bookCopy" }
		},

		// Stage 2
		{
			$unwind: { "path" : "$bookCopy", "preserveNullAndEmptyArrays" : false }
		},

		// Stage 3
		{
			$lookup: { "from" : "students", "localField" : "studentBarCode", "foreignField" : "_id", "as" : "student" }
		},

		// Stage 4
		{
			$unwind: { "path" : "$student", "preserveNullAndEmptyArrays" : true }
		},

		// Stage 5
		{
			$project: { "_id" : 1.0, "bookCopy" : 1.0, "student" : 1.0, "checkedOutDate" : 1.0, "checkedInDate" : 1.0, "studentBarCode" : 1.0, "bookCopyBarCode" : 1.0, "checkedOutBy" : "$checkOutBy.name", "checkedInBy" : "$checkInBy.name" }
		},
	],

	// Options
	{
		cursor: {
			batchSize: 50
		}
	}

	// Created with Studio 3T, the IDE for MongoDB - https://studio3t.com/

);
