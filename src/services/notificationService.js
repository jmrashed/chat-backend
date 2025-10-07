const User = require("../models/User");

class NotificationService {
  constructor(io) {
    this.io = io;
  }

  // Send mention notification
  async sendMentionNotification(mentionedUserIds, message, mentionedBy) {
    try {
      for (const userId of mentionedUserIds) {
        // Send real-time notification via socket
        this.io.to(userId.toString()).emit('mention', {
          messageId: message._id,
          content: message.content,
          sender: mentionedBy,
          room: message.room,
          timestamp: message.timestamp
        });

        // Here you could also send email/push notifications
        // await this.sendEmailNotification(userId, message, mentionedBy);
        // await this.sendPushNotification(userId, message, mentionedBy);
      }
    } catch (error) {
      console.error('Error sending mention notifications:', error);
    }
  }

  // Send message status update
  async sendStatusUpdate(room, messageId, status, userId = null) {
    try {
      const eventData = { messageId, status };
      if (userId) eventData.userId = userId;

      this.io.to(room).emit(`message${status.charAt(0).toUpperCase() + status.slice(1)}`, eventData);
    } catch (error) {
      console.error('Error sending status update:', error);
    }
  }

  // Send typing notification
  async sendTypingNotification(room, user, isTyping) {
    try {
      const event = isTyping ? 'userTyping' : 'userStoppedTyping';
      this.io.to(room).emit(event, {
        userId: user._id,
        username: user.username
      });
    } catch (error) {
      console.error('Error sending typing notification:', error);
    }
  }

  // Future: Email notification for mentions
  async sendEmailNotification(userId, message, mentionedBy) {
    // Implementation for email notifications
    // This would integrate with email service like SendGrid, AWS SES, etc.
  }

  // Future: Push notification for mentions
  async sendPushNotification(userId, message, mentionedBy) {
    // Implementation for push notifications
    // This would integrate with push notification service like FCM, APNS, etc.
  }
}

module.exports = NotificationService;