db.books.aggregate(

	// Pipeline
	[
		// Stage 1
		{
			$unwind: "$bookCopies"
		},

		// Stage 2
		{
			$group: {
				_id: "$bookCopies.barCode", count : { $sum : 1 }
			}
		},

		// Stage 3
		{
			$sort: {
				count : -1
			}
		},

		// Stage 4
		{
			$match: {
				count: { $gt: 1 }
			}
		},

	]

	// Created with Studio 3T, the IDE for MongoDB - https://studio3t.com/

);
