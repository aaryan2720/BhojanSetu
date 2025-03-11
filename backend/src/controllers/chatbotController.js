const ChatbotQuestion = require('../models/Chatbot');

const chatbotController = {
  async getNextQuestion(req, res) {
    try {
      const { questionId, selectedOption } = req.body;
      
      if (!questionId) {
        // Return initial question
        const initialQuestion = await ChatbotQuestion.findOne({ 
          category: 'general',
          questionId: 'initial' 
        });
        return res.json(initialQuestion);
      }

      const currentQuestion = await ChatbotQuestion.findOne({ questionId });
      const nextQuestionId = currentQuestion.options[selectedOption].nextQuestionId;
      
      if (nextQuestionId) {
        const nextQuestion = await ChatbotQuestion.findOne({ 
          questionId: nextQuestionId 
        });
        res.json(nextQuestion);
      } else {
        res.json({ 
          type: 'action',
          action: currentQuestion.options[selectedOption].action 
        });
      }
    } catch (error) {
      res.status(500).json({ message: 'Error processing chatbot request' });
    }
  },

  async handleAction(req, res) {
    const { action, data } = req.body;
    
    try {
      switch (action) {
        case 'createDonation':
          // Handle donation creation
          break;
        case 'findFood':
          // Handle food search
          break;
        case 'getHelp':
          // Handle help request
          break;
        default:
          throw new Error('Invalid action');
      }
      
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ message: 'Error processing action' });
    }
  }
};

module.exports = chatbotController; 