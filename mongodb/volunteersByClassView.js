db.volunteers.aggregate(

	// Pipeline
	[
		// Stage 1
		{
			$unwind: { "path" : "$volunteerForClasses" }
		},

		// Stage 2
		{
			$lookup: { "from" : "classes", "localField" : "volunteerForClasses.classId", "foreignField" : "_id", "as" : "class" }
		},

		// Stage 3
		{
			$unwind: { "path" : "$class" }
		},

		// Stage 4
		{
			$group: { "_id" : { "classId" : "$class._id", "teacherName" : "$class.teacherName", "grade" : "$class.grade" }, "volunteers" : { "$addToSet" : { "volunteerId" : "$_id", "firstName" : "$firstName", "lastName" : "$lastName", "dayOfWeek" : "$volunteerForClasses.dayOfWeek" } } }
		},

		// Stage 5
		{
			$project: { "_id" : "$_id.classId", "teacherName" : "$_id.teacherName", "grade" : "$_id.grade", "volunteers" : 1.0 }
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
