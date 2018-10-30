db.getCollection("students").aggregate(

	// Pipeline
	[
		// Stage 1
		{
			$lookup: // Equality Match
			{
			    from: "currentreservations",
			    localField: "_id",
			    foreignField: "studentBarCode",
			    as: "reservation"
			}
		},

	]

	// Created with Studio 3T, the IDE for MongoDB - https://studio3t.com/

);
