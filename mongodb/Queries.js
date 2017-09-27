// Users logged in the past few days
db.volunteerlogons.aggregate(
    
        // Pipeline
        [
            // Stage 1
            {
                $match: {
                    $and: [
                          {"logonTime" : { "$gt" : new ISODate('2017-09-19T00:00:00.000') }},
                          {"status" : NumberInt(0)},
                          {"volunteerId" : { "$ne" : null }}
                          ]	
                }
            },
    
            // Stage 2
            {
                $lookup: {
                    "from" : "volunteers",
                    "localField" : "volunteerId",
                    "foreignField" : "_id",
                    "as" : "volunteer"
                }
            },
    
            // Stage 3
            {
                $unwind: {
                    path : "$volunteer"
                }
            },
    
            // Stage 4
            {
                $lookup: {
                    "from" : "classes",
                    "localField" : "volunteer.volunteerForClasses.classId",
                    "foreignField" : "_id",
                    "as" : "class"
                }
            },
    
            // Stage 5
            {
                $group: {
                    _id : { volunteerId: '$volunteerId', firstName: '$volunteer.firstName', lastName: '$volunteer.lastName', class: '$class.teacherName', grade: '$class.grade' }, 
                    totalLogins : { $sum: 1},
                    firstLoginDate : { $first: '$logonTime'},
                    lastLoginDate : { $last: '$logonTime'}
                }
            },
    
            // Stage 6
            {
                $sort: {
                    "totalLogins" : -1
                }
            },
    
        ]
    
        // Created with Studio 3T, the IDE for MongoDB - https://studio3t.com/
    
    );
    
// Check-ins per volunteer
db.currentreservations.aggregate(
    
        // Pipeline
        [
            // Stage 1
            {
                $match: {
                    $and : [
                        {"checkedOutDate" : { $gt : ISODate('2017-09-18') }},
                        {"checkedInDate" : { $ne : null }}
                        ]
                }
            },
    
            // Stage 2
            {
                $redact: {
                    $cond : {
                      if : { $eq : ["$checkedInDate" , "$checkedOutDate"] },
                      then : "$$PRUNE",
                      else : "$$KEEP"
                    }
                }
            },
    
            // Stage 3
            {
                $group: {
                    _id : { volunteerId : "$checkInBy.volunteerId", name : "$checkInBy.name", checkedInDate : "$checkedInDate" },
                    count : { $sum : 1 }
                }
            },
    
            // Stage 4
            {
                $sort: {
                    "_id.checkedInDate" : 1,
                    "count" : -1
                }
            },
    
        ]
    
        // Created with Studio 3T, the IDE for MongoDB - https://studio3t.com/
    
    );
    

// Check-outs per volunteer

db.currentreservations.aggregate(
    
        // Pipeline
        [
            // Stage 1
            {
                $match: {
                    $and : [
                        {"checkedOutDate" : { $gt : ISODate('2017-09-18') }}
                        ]
                }
            },
    
            // Stage 2
            {
                $redact: {
                    $cond : {
                      if : { $eq : ["$checkedInDate" , "$checkedOutDate"] },
                      then : "$$PRUNE",
                      else : "$$KEEP"
                    }
                }
            },
    
            // Stage 3
            {
                $group: {
                    _id : { volunteerId : "$checkOutBy.volunteerId", name : "$checkOutBy.name", checkedOutDate : "$checkedOutDate" },
                    count : { $sum : 1 },
                    started : { $first: "$createdDate" },
                    ended : { $last: "$createdDate" }
                }
            },
    
            // Stage 4
            {
                $sort: {
                    "_id.checkedOutDate" : 1,
                    "count" : -1
                }
            },
    
        ]
    
        // Created with Studio 3T, the IDE for MongoDB - https://studio3t.com/
    
    );
    

// Total Books Checked Out each day

db.currentreservations.aggregate(
    
        // Pipeline
        [
            // Stage 1
            {
                $match: {
                    $and : [
                        {"checkedOutDate" : { $gte : ISODate('2017-09-18') }}
                        ]
                }
            },
    
            // Stage 2
            {
                $redact: {
                    $cond : {
                      if : { $eq : ["$checkedInDate" , "$checkedOutDate"] },
                      then : "$$PRUNE",
                      else : "$$KEEP"
                    }
                }
            },
    
            // Stage 3
            {
                $group: {
                    _id : "$checkedOutDate",
                    count : { $sum : 1 },
                    started : { $first: "$createdDate" },
                    ended : { $last: "$createdDate" }
                }
            },
    
            // Stage 4
            {
                $sort: {
                    "_id" : 1,
                    "count" : -1
                }
            },
    
        ]
    
        // Created with Studio 3T, the IDE for MongoDB - https://studio3t.com/
    
    );
    

// Total Books Checked In Each Day

db.currentreservations.aggregate(
    
        // Pipeline
        [
            // Stage 1
            {
                $match: {
                    $and : [
                        {"checkedInDate" : { $gte : ISODate('2017-09-18') }}
                        ]
                }
            },
    
            // Stage 2
            {
                $redact: {
                    $cond : {
                      if : { $eq : ["$checkedInDate" , "$checkedOutDate"] },
                      then : "$$PRUNE",
                      else : "$$KEEP"
                    }
                }
            },
    
            // Stage 3
            {
                $group: {
                    _id : "$checkedInDate",
                    count : { $sum : 1 },
                    started : { $first: "$modifiedDate" },
                    ended : { $last: "$modifiedDate" }
                }
            },
    
            // Stage 4
            {
                $sort: {
                    "_id" : 1,
                    "count" : -1
                }
            },
    
        ]
    
        // Created with Studio 3T, the IDE for MongoDB - https://studio3t.com/
    
    );
    

// Books checked out for more than X days


db.currentreservations.aggregate(
    
        // Pipeline
        [
            // Stage 1
            {
                $match: { "checkedInDate" : { "$eq" : null } }
            },
    
            // Stage 2
            {
                $lookup: { "from" : "booksByBookCopies", "localField" : "bookCopyBarCode", "foreignField" : "_id", "as" : "bookCopy" }
            },
    
            // Stage 3
            {
                $unwind: { "path" : "$bookCopy", "preserveNullAndEmptyArrays" : false }
            },
    
            // Stage 4
            {
                $lookup: { "from" : "students", "localField" : "studentBarCode", "foreignField" : "_id", "as" : "student" }
            },
    
            // Stage 5
            {
                $unwind: { "path" : "$student", "preserveNullAndEmptyArrays" : true }
            },
    
            // Stage 6
            {
                $project: { 
                  "_id" : 1.0, 
                  "bookCopy" : 1.0, 
                  "student" : 1.0, 
                  "checkedOutDate" : 1.0, 
                  "checkedInDate" : 1.0,
                  "numberOfDays" : { $divide: [{$subtract : [ISODate(), "$checkedOutDate"]}, 86400000]}
                 }
            },
    
            // Stage 7
            {
                $match: {
                    numberOfDays : { $gt : 2.5 }
                }
            },
    
        ]
    
        // Created with Studio 3T, the IDE for MongoDB - https://studio3t.com/
    
    );
    

    // Checked out books by teacher

    