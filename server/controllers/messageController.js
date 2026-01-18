const asyncWrapper = require('../utils/asyncWrapper');
const Messages = require('../models/Message');
const { createMessage } = require('../services/messageService');
const ErrorHandler = require('../utils/ErrorHandlerClass');

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
                ],

                // Exclude Deleted messages for specific user
                deletedFor: { $ne: userId }
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
        ],
        deletedFor: { $ne: userId }
    }).sort({ createdAt: -1 }).limit(50);

    return res.status(200).json({
        success: true,
        conversation,
    });
});


// Sending a message
const sendMessage = asyncWrapper(async (req, res, next) => {
    const { partnerId } = req.params;
    const senderId = req.user._id;
    const { content } = req.body;
    if (!partnerId || !content) {
        return next(new ErrorHandler("Receiver and content are required!", 400))
    }

    // Calling createMessage service to pass data
    const message = await createMessage({
        partnerId,
        senderId,
        content
    });

    // 2. Real-Time Push
    const io = req.app.get('socketio');
    if (io) {
        // We emit to the room named after the partner's ID
        io.to(partnerId.toString()).emit('newMessage', message);
    }

    return res.status(201).json({
        success: true,
        message
    });
});

// Delete conversation for one user
const deleteConversation = asyncWrapper(async (req, res, next) => {
    const { partnerId } = req.params;
    const userId = req.user._id;

    await Messages.updateMany(
        {
            $or: [
                { sender: userId, receiver: partnerId },
                { sender: partnerId, receiver: userId }
            ]
        },
        {
            $addToSet: { deletedFor: userId } // $addToSet prevents duplicates
        }
    );

    // * Deletes garbage messages deleted for both users (OPTIONAL)
    await Messages.deleteMany({
        $or: [
            { sender: userId, receiver: partnerId },
            { sender: partnerId, receiver: userId }
        ],
        deletedFor: { $all: [userId, partnerId] }
    });

    return res.status(200).json({
        success: true,
        message: "Conversation deleted successfully"
    });
});


module.exports = {
    viewAllMessages,
    viewConversation,
    sendMessage,
    deleteConversation,
}
