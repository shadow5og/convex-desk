import { useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";
import { Card, Grid, Title, Text, Badge, Stack, Group, Button, Notification } from "@mantine/core";
import { IconWash, IconSparkles, IconBell, IconCreditCard } from "@tabler/icons-react";
import { motion, AnimatePresence } from "motion/react";

export function Dashboard() {
  const dashboardData = useQuery(api.dashboard.getUserDashboard);

  if (!dashboardData) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  const { activeOrders, activeBookings, unreadNotifications, recentTransactions } = dashboardData;

  const getStatusColor = (status: string) => {
    switch (status) {
      case "scheduled": return "blue";
      case "washing": return "yellow";
      case "folding": return "orange";
      case "completed": return "green";
      case "pending": return "gray";
      case "assigned": return "blue";
      case "in_progress": return "yellow";
      default: return "gray";
    }
  };

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <Title order={1} mb="xl" className="text-gray-800">
        Dashboard
      </Title>

      {/* Notifications */}
      {unreadNotifications.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-6"
        >
          <Stack gap="xs">
            {unreadNotifications.slice(0, 3).map((notification) => (
              <Notification
                key={notification._id}
                icon={<IconBell size={16} />}
                title={`${notification.type.charAt(0).toUpperCase() + notification.type.slice(1)} Update`}
                color={notification.type === "laundry" ? "blue" : "green"}
                withCloseButton={false}
                className="shadow-sm"
              >
                {notification.message}
              </Notification>
            ))}
          </Stack>
        </motion.div>
      )}

      <Grid>
        {/* Active Laundry Orders */}
        <Grid.Col span={{ base: 12, md: 6 }}>
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1 }}
          >
            <Card
              shadow="sm"
              padding="lg"
              radius="md"
              withBorder
              className="h-full"
            >
              <Group justify="space-between" mb="md">
                <Group>
                  <IconWash size={24} className="text-blue-600" />
                  <Title order={3}>Active Laundry Orders</Title>
                </Group>
                <Badge variant="light" color="blue">
                  {activeOrders.length}
                </Badge>
              </Group>

              <Stack gap="md">
                {activeOrders.length === 0 ? (
                  <Text c="dimmed" ta="center" py="xl">
                    No active laundry orders
                  </Text>
                ) : (
                  activeOrders.map((order) => (
                    <motion.div
                      key={order._id}
                      whileHover={{ scale: 1.02 }}
                      className="p-4 bg-gray-50 rounded-lg border"
                    >
                      <Group justify="space-between" mb="xs">
                        <Text fw={500}>
                          {order.type === "delivery" ? "Delivery" : "Shop Drop-off"}
                        </Text>
                        <Badge color={getStatusColor(order.status)} variant="light">
                          {order.status.replace("_", " ")}
                        </Badge>
                      </Group>
                      <Text size="sm" c="dimmed">
                        {order.items.length} items • ${order.totalAmount}
                      </Text>
                      {order.scheduledAt && (
                        <Text size="xs" c="dimmed">
                          Scheduled: {new Date(order.scheduledAt).toLocaleDateString()}
                        </Text>
                      )}
                    </motion.div>
                  ))
                )}
              </Stack>
            </Card>
          </motion.div>
        </Grid.Col>

        {/* Active Cleaning Bookings */}
        <Grid.Col span={{ base: 12, md: 6 }}>
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
          >
            <Card
              shadow="sm"
              padding="lg"
              radius="md"
              withBorder
              className="h-full"
            >
              <Group justify="space-between" mb="md">
                <Group>
                  <IconSparkles size={24} className="text-green-600" />
                  <Title order={3}>Active Cleaning Bookings</Title>
                </Group>
                <Badge variant="light" color="green">
                  {activeBookings.length}
                </Badge>
              </Group>

              <Stack gap="md">
                {activeBookings.length === 0 ? (
                  <Text c="dimmed" ta="center" py="xl">
                    No active cleaning bookings
                  </Text>
                ) : (
                  activeBookings.map((booking) => (
                    <motion.div
                      key={booking._id}
                      whileHover={{ scale: 1.02 }}
                      className="p-4 bg-gray-50 rounded-lg border"
                    >
                      <Group justify="space-between" mb="xs">
                        <Text fw={500}>
                          {booking.type.charAt(0).toUpperCase() + booking.type.slice(1)} Cleaning
                        </Text>
                        <Badge color={getStatusColor(booking.status)} variant="light">
                          {booking.status.replace("_", " ")}
                        </Badge>
                      </Group>
                      <Text size="sm" c="dimmed">
                        ${booking.totalAmount} • {booking.estimatedDuration}h
                      </Text>
                      <Text size="xs" c="dimmed">
                        Scheduled: {new Date(booking.scheduledAt).toLocaleDateString()}
                      </Text>
                    </motion.div>
                  ))
                )}
              </Stack>
            </Card>
          </motion.div>
        </Grid.Col>

        {/* Recent Transactions */}
        <Grid.Col span={12}>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <Card
              shadow="sm"
              padding="lg"
              radius="md"
              withBorder
            >
              <Group justify="space-between" mb="md">
                <Group>
                  <IconCreditCard size={24} className="text-purple-600" />
                  <Title order={3}>Recent Transactions</Title>
                </Group>
              </Group>

              <Stack gap="md">
                {recentTransactions.length === 0 ? (
                  <Text c="dimmed" ta="center" py="xl">
                    No recent transactions
                  </Text>
                ) : (
                  recentTransactions.map((transaction) => (
                    <motion.div
                      key={transaction._id}
                      whileHover={{ scale: 1.01 }}
                      className="p-4 bg-gray-50 rounded-lg border"
                    >
                      <Group justify="space-between">
                        <div>
                          <Text fw={500}>${transaction.amount}</Text>
                          <Text size="sm" c="dimmed">
                            {new Date(transaction.transactionDate).toLocaleDateString()}
                          </Text>
                        </div>
                        <Badge 
                          color={transaction.status === "completed" ? "green" : transaction.status === "failed" ? "red" : "yellow"}
                          variant="light"
                        >
                          {transaction.status}
                        </Badge>
                      </Group>
                    </motion.div>
                  ))
                )}
              </Stack>
            </Card>
          </motion.div>
        </Grid.Col>
      </Grid>
    </div>
  );
}
