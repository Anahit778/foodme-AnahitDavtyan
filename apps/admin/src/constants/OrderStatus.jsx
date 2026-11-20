const OrderStatus = {
    NEW: 'NEW',
    ACCEPTED: 'ACCEPTED',
    DELIVERED: 'DELIVERED',
    REJECTED: 'REJECTED',
    // KAN-10: set only by the customer while the order is NEW. Final.
    CANCELLED: 'CANCELLED',
};

const OrderStatusColors = {
    [OrderStatus.NEW]: 'info',
    [OrderStatus.ACCEPTED]: 'warning',
    [OrderStatus.DELIVERED]: 'success',
    [OrderStatus.REJECTED]: 'error',
    [OrderStatus.CANCELLED]: 'default',
};

// Statuses whose totals are not earned revenue.
const NonRevenueStatuses = [OrderStatus.REJECTED, OrderStatus.CANCELLED];

// Allowed forward transitions per current status
const OrderStatusTransitions = {
    [OrderStatus.NEW]: [OrderStatus.ACCEPTED, OrderStatus.REJECTED],
    [OrderStatus.ACCEPTED]: [OrderStatus.DELIVERED, OrderStatus.REJECTED],
    [OrderStatus.DELIVERED]: [],
    [OrderStatus.REJECTED]: [],
    [OrderStatus.CANCELLED]: [],
};

export { OrderStatus, OrderStatusColors, OrderStatusTransitions, NonRevenueStatuses };
