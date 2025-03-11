const mongoose = require('mongoose');

const chatbotQuestionSchema = new mongoose.Schema({
  questionId: {
    type: String,
    required: true,
    unique: true
  },
  text: {
    type: String,
    required: true
  },
  options: [{
    text: String,
    nextQuestionId: String,
    action: String
  }],
  category: {
    type: String,
    enum: ['general', 'donation', 'reservation', 'location', 'price']
  }
});

const ChatbotQuestion = mongoose.model('ChatbotQuestion', chatbotQuestionSchema);
module.exports = ChatbotQuestion; 