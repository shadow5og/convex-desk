import { useState } from "react";
import { useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
import { 
  Card, 
  TextInput, 
  Button, 
  Text, 
  Alert, 
  Group, 
  Stack, 
  Title, 
  Select,
  NumberInput,
  Textarea,
  Divider
} from "@mantine/core";
import { IconWash, IconCheck, IconX, IconPlus, IconTrash } from "@tabler/icons-react";
import { motion, AnimatePresence } from "motion/react";

interface LaundryItem {
  type: string;
  quantity: number;
  price: number;
}

const LAUNDRY_TYPES = [
  { value: "shirt", label: "Shirt", price: 3.50 },
  { value: "pants", label: "Pants", price: 4.00 },
  { value: "dress", label: "Dress", price: 6.00 },
  { value: "suit", label: "Suit", price: 12.00 },
  { value: "bedsheet", label: "Bed Sheet", price: 5.00 },
  { value: "towel", label: "Towel", price: 2.50 },
  { value: "jacket", label: "Jacket", price: 8.00 },
];

export function OrderForm() {
  const [orderType, setOrderType] = useState<"delivery" | "shop_drop" | null>(null);
  const [items, setItems] = useState<LaundryItem[]>([]);
  const [address, setAddress] = useState("");
  const [notes, setNotes] = useState("");
  const [scheduledDate, setScheduledDate] = useState("");
  const [scheduledTime, setScheduledTime] = useState("");
  const [result, setResult] = useState<{ success: boolean; message: string } | null>(null);

  const createOrder = useMutation(api.laundry.createLaundryOrder);

  const addItem = () => {
    setItems([...items, { type: "", quantity: 1, price: 0 }]);
  };

  const removeItem = (index: number) => {
    setItems(items.filter((_, i) => i !== index));
  };

  const updateItem = (index: number, field: keyof LaundryItem, value: string | number) => {
    const newItems = [...items];
    if (field === 'type') {
      const laundryType = LAUNDRY_TYPES.find(t => t.value === value);
      newItems[index] = {
        ...newItems[index],
        type: value as string,
        price: laundryType?.price || 0
      };
    } else {
      newItems[index] = { ...newItems[index], [field]: value };
    }
    setItems(newItems);
  };

  const totalAmount = items.reduce((sum, item) => sum + (item.price * item.quantity), 0);

  const handleSubmit = async () => {
    if (!orderType || items.length === 0) {
      setResult({ success: false, message: "Please select order type and add items" });
      return;
    }

    if (orderType === "delivery" && !address) {
      setResult({ success: false, message: "Please provide delivery address" });
      return;
    }

    try {
      let scheduledAt: number | undefined;
      if (scheduledDate && scheduledTime) {
        scheduledAt = new Date(`${scheduledDate}T${scheduledTime}`).getTime();
      }

      await createOrder({
        type: orderType,
        items: items.filter(item => item.type && item.quantity > 0),
        scheduledAt,
        address: orderType === "delivery" ? address : undefined,
        notes: notes || undefined,
      });

      setResult({ 
        success: true, 
        message: "Laundry order created successfully!" 
      });

      // Reset form
      setOrderType(null);
      setItems([]);
      setAddress("");
      setNotes("");
      setScheduledDate("");
      setScheduledTime("");
    } catch (error) {
      setResult({ 
        success: false, 
        message: error instanceof Error ? error.message : "Failed to create order" 
      });
    }
  };

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <Title order={1} mb="xl" className="text-gray-800">
        New Laundry Order
      </Title>

      <Stack gap="lg">
        {/* Order Type Selection */}
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
            <Title order={3} mb="md">Order Type</Title>
            <Group>
              <Button
                variant={orderType === "delivery" ? "filled" : "outline"}
                onClick={() => setOrderType("delivery")}
                leftSection={<IconWash size={16} />}
              >
                Delivery Service
              </Button>
              <Button
                variant={orderType === "shop_drop" ? "filled" : "outline"}
                onClick={() => setOrderType("shop_drop")}
                leftSection={<IconWash size={16} />}
              >
                Shop Drop-off
              </Button>
            </Group>
          </Card>
        </motion.div>

        {/* Items */}
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
            <Group justify="space-between" mb="md">
              <Title order={3}>Items</Title>
              <Button leftSection={<IconPlus size={16} />} onClick={addItem} variant="light">
                Add Item
              </Button>
            </Group>

            <Stack gap="md">
              {items.length === 0 ? (
                <Text c="dimmed" ta="center" py="xl">
                  No items added yet. Click "Add Item" to get started.
                </Text>
              ) : (
                items.map((item, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="p-4 bg-gray-50 rounded-lg border"
                  >
                    <Group align="end">
                      <Select
                        label="Item Type"
                        placeholder="Select item"
                        data={LAUNDRY_TYPES}
                        value={item.type}
                        onChange={(value) => updateItem(index, 'type', value || '')}
                        style={{ flex: 1 }}
                      />
                      <NumberInput
                        label="Quantity"
                        value={item.quantity}
                        onChange={(value) => updateItem(index, 'quantity', value || 1)}
                        min={1}
                        style={{ width: 100 }}
                      />
                      <Text size="sm" fw={500} style={{ width: 80 }}>
                        ${(item.price * item.quantity).toFixed(2)}
                      </Text>
                      <Button
                        color="red"
                        variant="light"
                        onClick={() => removeItem(index)}
                        size="sm"
                      >
                        <IconTrash size={16} />
                      </Button>
                    </Group>
                  </motion.div>
                ))
              )}

              {items.length > 0 && (
                <>
                  <Divider />
                  <Group justify="space-between">
                    <Text size="lg" fw={600}>Total Amount:</Text>
                    <Text size="lg" fw={600} c="blue">${totalAmount.toFixed(2)}</Text>
                  </Group>
                </>
              )}
            </Stack>
          </Card>
        </motion.div>

        {/* Delivery Details */}
        {orderType === "delivery" && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <Card
              shadow="sm"
              padding="lg"
              radius="md"
              withBorder
            >
              <Title order={3} mb="md">Delivery Details</Title>
              <Stack gap="md">
                <TextInput
                  label="Delivery Address"
                  placeholder="Enter your full address"
                  value={address}
                  onChange={(e) => setAddress(e.currentTarget.value)}
                  required
                />
              </Stack>
            </Card>
          </motion.div>
        )}

        {/* Schedule */}
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
            <Title order={3} mb="md">Schedule (Optional)</Title>
            <Group grow>
              <TextInput
                label="Date"
                type="date"
                value={scheduledDate}
                onChange={(e) => setScheduledDate(e.currentTarget.value)}
              />
              <TextInput
                label="Time"
                type="time"
                value={scheduledTime}
                onChange={(e) => setScheduledTime(e.currentTarget.value)}
              />
            </Group>
          </Card>
        </motion.div>

        {/* Notes */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <Card
            shadow="sm"
            padding="lg"
            radius="md"
            withBorder
          >
            <Title order={3} mb="md">Additional Notes</Title>
            <Textarea
              placeholder="Any special instructions or preferences..."
              value={notes}
              onChange={(e) => setNotes(e.currentTarget.value)}
              rows={3}
            />
          </Card>
        </motion.div>

        {/* Submit Button */}
        <Button
          size="lg"
          onClick={handleSubmit}
          disabled={!orderType || items.length === 0}
          leftSection={<IconWash size={20} />}
          className="bg-blue-600 hover:bg-blue-700"
        >
          Create Order (${totalAmount.toFixed(2)})
        </Button>

        {/* Result */}
        <AnimatePresence>
          {result && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
            >
              <Alert
                icon={result.success ? <IconCheck size={16} /> : <IconX size={16} />}
                title={result.success ? "Success!" : "Error"}
                color={result.success ? "green" : "red"}
                onClose={() => setResult(null)}
                withCloseButton
              >
                {result.message}
              </Alert>
            </motion.div>
          )}
        </AnimatePresence>
      </Stack>
    </div>
  );
}
