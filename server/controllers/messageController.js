const asyncWrapper = require('../utils/asyncWrapper');
const Messages = require('../models/Message');


// Fetch and view all messages
const viewAllMessages = asyncWrapper(async (req, res, next) => {
    const userId = req.user._id;

    const messages = await Messages.aggregate([

        // Stage 1, matching by sender and receiver id, feth only if sender and receiver is current suer
        {
            $match: {
                $or: [
                    {
                        sender: userId
                    },
                    {
                        receiver: userId
                    }
                ]
            }
        },

        // Stage 2, sorting on base of createdAt timestamp, show latest first/on top
        {
            $sort: {
                createdAt: -1
            },
        },

        // Stage 3, grouping

        {
            $group: {

                // Group takes an ID, which is must
                _id: {
                    $cond: [
                        { $eq: ["$sender", userId] },
                        "$receiver",
                        "$sender"
                    ]
                },

                // Using accumulators to get the latest message and time (after sorting)
                lastMessage: {
                    $first: "$content"
                },
                lastTime: {
                    $first: "$createdAt"
                }
            }
        },


        //  Stage 4, lookup
        {
            $lookup: {
                from: "users",
                localField: "_id",
                foreignField: "_id",
                as: "partnerDetails"
            }
        },
        { $unwind: "$partnerDetails" },
        { $sort: { lastTime: -1 } }
    ]);


    return res.status(200).json({ success: true, messages });
});



// Get single conversation history/all messages
const viewConversation = asyncWrapper(async (req, res, next) => {
    const { partnerId } = req.params;
    const userId = req.user._id;
    const conversation = await Messages.find({
        $or: [
            {
                sender: userId, receiver: partnerId
            },
            {
                receiver: userId, sender: partnerId
            }
        ]
    }).sort({ createdAt: -1 }).limit(50);

    return res.status(200).json({
        success: true,
        conversation,
    });
});



module.exports = {
    viewAllMessages,
    viewConversation
}



