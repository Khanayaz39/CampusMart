const Conversation = require('../models/Conversation');
const Message = require('../models/Message');
const User = require('../models/User');
const Product = require('../models/Product');

exports.startConversation = async (req, res, next) => {
  try {
    const { userId, productId } = req.body;
    
    if (!userId) {
      return res.status(400).json({ message: 'Target user ID is required' });
    }

    if (userId.toString() === req.user._id.toString()) {
      return res.status(400).json({ message: 'Cannot start a chat with yourself' });
    }
    
    // Check if conversation already exists between these 2 users
    let query = {
      participants: { $all: [req.user._id, userId] }
    };
    if (productId) {
      query.product = productId;
    }

    let chat = await Conversation.findOne(query);

    if (!chat) {
      // Also check without productId if not found, to avoid duplicate chats between same peers
      chat = await Conversation.findOne({
        participants: { $all: [req.user._id, userId] }
      });

      if (!chat) {
        chat = await Conversation.create({
          participants: [req.user._id, userId],
          product: productId || undefined
        });
      } else if (productId && !chat.product) {
        chat.product = productId;
        await chat.save();
      }
    }
    
    chat = await Conversation.findById(chat._id)
      .populate('participants', 'name profileImage email hostel department college role isDeleted')
      .populate('product', 'title images price condition')
      .populate('lastMessage');

    res.status(200).json(chat);
  } catch (error) {
    next(error);
  }
};

exports.getConversations = async (req, res, next) => {
  try {
    const chats = await Conversation.find({ participants: { $in: [req.user._id] } })
      .populate('participants', 'name profileImage email hostel department college role isDeleted')
      .populate('product', 'title images price condition')
      .populate('lastMessage')
      .sort({ updatedAt: -1 });
      
    res.json(chats);
  } catch (error) {
    next(error);
  }
};

exports.getMessages = async (req, res, next) => {
  try {
    const chat = await Conversation.findById(req.params.chatId);
    if (!chat) {
      return res.status(404).json({ message: 'Conversation not found' });
    }

    const isParticipant = chat.participants.some(p => p.toString() === req.user._id.toString());
    if (!isParticipant) {
      return res.status(403).json({ message: 'Not authorized to view these messages' });
    }

    const messages = await Message.find({ conversation: req.params.chatId })
      .populate('sender', 'name profileImage email')
      .sort({ createdAt: 1 });

    res.json(messages);
  } catch (error) {
    next(error);
  }
};

exports.sendMessage = async (req, res, next) => {
  try {
    const { content, chatId, type } = req.body;
    
    if (!content || !content.trim()) {
      return res.status(400).json({ message: 'Message content is required' });
    }

    const chat = await Conversation.findById(chatId);
    if (!chat) {
      return res.status(404).json({ message: 'Conversation not found' });
    }

    const isParticipant = chat.participants.some(p => p.toString() === req.user._id.toString());
    if (!isParticipant) {
      return res.status(403).json({ message: 'Not authorized to send messages in this chat' });
    }

    // Check if recipient has deleted their account
    const recipientId = chat.participants.find(p => p.toString() !== req.user._id.toString());
    if (recipientId) {
      const recipient = await User.findById(recipientId);
      if (!recipient || recipient.isDeleted) {
        return res.status(400).json({ message: 'User has deleted their account. Message cannot be delivered.' });
      }
    }

    let message = await Message.create({
      sender: req.user._id,
      content: content.trim(),
      conversation: chatId,
      type: type || 'text',
      read: false
    });
    
    message = await message.populate('sender', 'name profileImage email');
    
    const updatedConv = await Conversation.findByIdAndUpdate(
      chatId, 
      { 
        lastMessage: message._id, 
        updatedAt: new Date() 
      },
      { new: true }
    )
    .populate('participants', 'name profileImage email hostel department college role isDeleted')
    .populate('product', 'title images price condition')
    .populate('lastMessage');

    // Real-Time Delivery via Socket.IO (deliver strictly to recipients, not back to sender)
    const io = req.app.get('io');
    if (io && updatedConv && updatedConv.participants) {
      const payload = {
        message,
        conversation: updatedConv
      };

      const myUserId = req.user._id.toString();

      updatedConv.participants.forEach((user) => {
        const uId = (user._id || user).toString();
        if (uId === myUserId) return; // Do not echo back to sender; sender renders from HTTP response
        io.to(uId).emit('message received', payload);
      });
    }
    
    res.json(message);
  } catch (error) {
    next(error);
  }
};

exports.markAsRead = async (req, res, next) => {
  try {
    const { chatId } = req.params;
    
    await Message.updateMany(
      {
        conversation: chatId,
        sender: { $ne: req.user._id },
        read: false
      },
      { $set: { read: true } }
    );

    res.json({ success: true, message: 'Messages marked as read' });
  } catch (error) {
    next(error);
  }
};

exports.getUnreadCount = async (req, res, next) => {
  try {
    const userConversations = await Conversation.find({ participants: req.user._id }).select('_id');
    const conversationIds = userConversations.map(c => c._id);
    
    const unreadCount = await Message.countDocuments({
      conversation: { $in: conversationIds },
      sender: { $ne: req.user._id },
      read: false
    });

    const unreadPerChat = await Message.aggregate([
      {
        $match: {
          conversation: { $in: conversationIds },
          sender: { $ne: req.user._id },
          read: false
        }
      },
      {
        $group: {
          _id: '$conversation',
          count: { $sum: 1 }
        }
      }
    ]);

    const chatUnreadMap = {};
    unreadPerChat.forEach(item => {
      chatUnreadMap[item._id.toString()] = item.count;
    });

    res.json({ unreadCount, chatUnreadMap });
  } catch (error) {
    next(error);
  }
};

exports.deleteConversation = async (req, res, next) => {
  try {
    const { chatId } = req.params;
    const chat = await Conversation.findById(chatId);
    if (!chat) {
      return res.status(404).json({ message: 'Conversation not found' });
    }

    const isParticipant = chat.participants.some(p => p.toString() === req.user._id.toString());
    if (!isParticipant) {
      return res.status(403).json({ message: 'Not authorized to delete this conversation' });
    }

    await Message.deleteMany({ conversation: chatId });
    await Conversation.findByIdAndDelete(chatId);

    res.json({ success: true, message: 'Conversation deleted' });
  } catch (error) {
    next(error);
  }
};
