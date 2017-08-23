db.books.aggregate(

	// Pipeline
	[
		// Stage 1
		{
			$group: {
				_id: "$title", count: { $sum : 1 }
			}
		},

		// Stage 2
		{
			$match: {
				count: { $gt: 1 }
			}
		},

	]

	// Created with Studio 3T, the IDE for MongoDB - https://studio3t.com/

);
