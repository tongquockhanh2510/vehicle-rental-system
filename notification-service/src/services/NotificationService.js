import { NotificationRepository } from '../repositories/NotificationRepository.js';
import { EventBus } from '../events/EventBus.js';
import amqp from 'amqplib';

const notificationRepository = new NotificationRepository();
const eventBus = new EventBus();

export class NotificationService {
  async sendNotification(userId, title, message, type, referenceId, actionUrl) {
    const notification = await notificationRepository.create({
      user_id: userId,
      title,
      message,
      type,
      reference_id: referenceId,
      action_url: actionUrl
    });

    // Publish notification event
    await eventBus.publish('notification_sent', {
      notificationId: notification._id,
      userId,
      type
    });

    return notification;
  }

  async getNotifications(userId) {
    return await notificationRepository.findByUserId(userId);
  }

  async getUnreadNotifications(userId) {
    return await notificationRepository.findUnreadByUserId(userId);
  }

  async markAsRead(notificationId) {
    return await notificationRepository.markAsRead(notificationId);
  }

  async markAllAsRead(userId) {
    return await notificationRepository.markAllAsRead(userId);
  }

  async subscribeToEvents() {
    // Subscribe to rental events
    await eventBus.subscribe('rental_request_created', (data) => {
      this.sendNotification(
        data.ownerId,
        'Có yêu cầu thuê xe mới',
        `Có yêu cầu thuê xe từ người dùng`,
        'RENTAL_REQUEST',
        data.rentalId
      );
    });

    await eventBus.subscribe('rental_confirmed', (data) => {
      this.sendNotification(
        data.renterId,
        'Yêu cầu thuê xe đã được xác nhận',
        `Yêu cầu thuê xe của bạn đã được chấp nhận`,
        'RENTAL_CONFIRMED',
        data.rentalId
      );
    });

    await eventBus.subscribe('rental_rejected', (data) => {
      this.sendNotification(
        data.renterId,
        'Yêu cầu thuê xe đã bị từ chối',
        `Yêu cầu thuê xe của bạn đã bị từ chối`,
        'RENTAL_REJECTED',
        data.rentalId
      );
    });

    // Subscribe to payment events
    // await eventBus.subscribe('payment_completed', (data) => {
    //   this.sendNotification(
    //     data.renterId,
    //     'Thanh toán thành công',
    //     `Thanh toán ${data.amount} đã hoàn tất`,
    //     'PAYMENT_SUCCESS',
    //     data.paymentId
    //   );
    // });

    // // Subscribe to tracking events
    // await eventBus.subscribe('vehicle_out_of_bounds', (data) => {
    //   this.sendNotification(
    //     data.ownerId,
    //     'Cảnh báo: Xe vượt phạm vi',
    //     `Xe của bạn đã di chuyển ra khỏi khu vực được phép`,
    //     'VEHICLE_OUT_OF_BOUNDS',
    //     data.rentalRequestId
    //   );
    // });

    // Subscribe to dispute events
    await eventBus.subscribe('dispute_created', (data) => {
      this.sendNotification(
        data.adminId,
        'Có khiếu nại mới',
        `Có khiếu nại về hư hỏng xe`,
        'DISPUTE_CREATED',
        data.disputeId
      );
    });

    await eventBus.subscribe('dispute_approved', (data) => {
      this.sendNotification(
        data.ownerId,
        'Khiếu nại đã được phê duyệt',
        `Khiếu nại về hư hỏng xe đã được phê duyệt với số tiền bồi thường ${data.compensationAmount}`,
        'DISPUTE_APPROVED',
        data.disputeId
      );
    });

    await eventBus.subscribe('dispute_rejected', (data) => {
      this.sendNotification(
        data.ownerId,
        'Khiếu nại đã bị từ chối',
        `Khiếu nại về hư hỏng xe đã bị từ chối`,
        'DISPUTE_REJECTED',
        data.disputeId
      );
    });
  }
}

export default new NotificationService();