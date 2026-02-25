import { useState } from "react";
import { useMutation, useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";
import { Card, TextInput, Button, Text, Alert, Group, Stack, Badge, Title } from "@mantine/core";
import { IconScan, IconCheck, IconX, IconWash } from "@tabler/icons-react";
import { motion, AnimatePresence } from "motion/react";
import { Id } from "../../convex/_generated/dataModel";

export function Scanner() {
  const [barcode, setBarcode] = useState("");
  const [selectedOrderId, setSelectedOrderId] = useState<Id<"laundryOrders"> | null>(null);
  const [scanResult, setScanResult] = useState<{ success: boolean; message: string } | null>(null);

  const userOrders = useQuery(api.laundry.getUserOrders);
  const machineData = useQuery(api.laundry.getMachineByBarcode, barcode ? { barcode } : "skip");
  const scanAndStartMachine = useMutation(api.laundry.scanAndStartMachine);

  const availableOrders = userOrders?.filter(order => 
    order.status === "scheduled" || order.status === "collected"
  ) || [];

  const handleScan = async () => {
    if (!barcode || !selectedOrderId) {
      setScanResult({ success: false, message: "Please enter a barcode and select an order" });
      return;
    }

    try {
      const result = await scanAndStartMachine({
        barcode,
        orderId: selectedOrderId,
      });
      
      setScanResult({ 
        success: true, 
        message: `Successfully started ${result.machine}! Your laundry is now washing.` 
      });
      setBarcode("");
      setSelectedOrderId(null);
    } catch (error) {
      setScanResult({ 
        success: false, 
        message: error instanceof Error ? error.message : "Failed to start machine" 
      });
    }
  };

  return (
    <div className="p-6 max-w-2xl mx-auto">
      <Title order={1} mb="xl" className="text-gray-800">
        Machine Scanner
      </Title>

      <Stack gap="lg">
        {/* Scanner Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <Card
            shadow="sm"
            padding="lg"
            radius="md"
            withBorder
          >
            <Group mb="md">
              <IconScan size={24} className="text-blue-600" />
              <Title order={3}>Scan Machine Barcode</Title>
            </Group>

            <Stack gap="md">
              <TextInput
                placeholder="Enter or scan machine barcode"
                value={barcode}
                onChange={(e) => setBarcode(e.currentTarget.value)}
                size="lg"
                leftSection={<IconScan size={16} />}
              />

              {/* Machine Info */}
              <AnimatePresence>
                {barcode && machineData && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                  >
                    <Alert
                      icon={<IconWash size={16} />}
                      title="Machine Found"
                      color={machineData.status === "idle" ? "green" : "yellow"}
                    >
                      <Text>
                        <strong>{machineData.name}</strong> ({machineData.type})
                      </Text>
                      <Badge 
                        color={machineData.status === "idle" ? "green" : machineData.status === "running" ? "yellow" : "red"}
                        variant="light"
                        mt="xs"
                      >
                        {machineData.status}
                      </Badge>
                    </Alert>
                  </motion.div>
                )}
              </AnimatePresence>

              {barcode && !machineData && (
                <Alert icon={<IconX size={16} />} title="Machine Not Found" color="red">
                  No machine found with barcode: {barcode}
                </Alert>
              )}
            </Stack>
          </Card>
        </motion.div>

        {/* Order Selection */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <Card
            shadow="sm"
            padding="lg"
            radius="md"
            withBorder
          >
            <Title order={3} mb="md">Select Order to Start</Title>

            <Stack gap="md">
              {availableOrders.length === 0 ? (
                <Text c="dimmed" ta="center" py="xl">
                  No orders available for washing
                </Text>
              ) : (
                availableOrders.map((order) => (
                  <motion.div
                    key={order._id}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className={`p-4 rounded-lg border cursor-pointer transition-colors ${
                      selectedOrderId === order._id 
                        ? "bg-blue-50 border-blue-300" 
                        : "bg-gray-50 border-gray-200 hover:bg-gray-100"
                    }`}
                    onClick={() => setSelectedOrderId(order._id)}
                  >
                    <Group justify="space-between" mb="xs">
                      <Text fw={500}>
                        {order.type === "delivery" ? "Delivery" : "Shop Drop-off"}
                      </Text>
                      <Badge color="blue" variant="light">
                        {order.status}
                      </Badge>
                    </Group>
                    <Text size="sm" c="dimmed">
                      {order.items.length} items • ${order.totalAmount}
                    </Text>
                    {selectedOrderId === order._id && (
                      <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="mt-2"
                      >
                        <Badge color="blue" variant="filled" size="sm">
                          Selected
                        </Badge>
                      </motion.div>
                    )}
                  </motion.div>
                ))
              )}
            </Stack>
          </Card>
        </motion.div>

        {/* Action Button */}
        <Button
          size="lg"
          onClick={handleScan}
          disabled={!barcode || !selectedOrderId || !machineData || machineData.status !== "idle"}
          leftSection={<IconScan size={20} />}
          className="bg-blue-600 hover:bg-blue-700"
        >
          Start Machine
        </Button>

        {/* Result */}
        <AnimatePresence>
          {scanResult && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
            >
              <Alert
                icon={scanResult.success ? <IconCheck size={16} /> : <IconX size={16} />}
                title={scanResult.success ? "Success!" : "Error"}
                color={scanResult.success ? "green" : "red"}
                onClose={() => setScanResult(null)}
                withCloseButton
              >
                {scanResult.message}
              </Alert>
            </motion.div>
          )}
        </AnimatePresence>
      </Stack>
    </div>
  );
}
