db.classes.aggregate(

	// Pipeline
	[
		// Stage 1
		{
			$unwind: { "path" : "$students", "preserveNullAndEmptyArrays" : true }
		},

		// Stage 2
		{
			$project: { "_id" : "$students.barCode", "firstName" : "$students.firstName", "lastName" : "$students.lastName", "teacherName" : 1.0, "grade" : 1.0, "teacherId" : "$_id" }
		},

		// Stage 3
		{
			$match: { "_id" : { "$exists" : true } }
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
