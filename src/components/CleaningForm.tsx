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
  Textarea
} from "@mantine/core";
import { IconSparkles, IconCheck, IconX } from "@tabler/icons-react";
import { motion, AnimatePresence } from "motion/react";

const CLEANING_TYPES = [
  { 
    value: "standard", 
    label: "Standard Cleaning", 
    description: "Regular cleaning service",
    basePrice: 80,
    duration: 2
  },
  { 
    value: "deep", 
    label: "Deep Cleaning", 
    description: "Thorough cleaning including hard-to-reach areas",
    basePrice: 150,
    duration: 4
  },
  { 
    value: "move_out", 
    label: "Move-out Cleaning", 
    description: "Complete cleaning for moving out",
    basePrice: 200,
    duration: 5
  },
  { 
    value: "custom", 
    label: "Custom Cleaning", 
    description: "Customized cleaning service",
    basePrice: 100,
    duration: 3
  },
];

export function CleaningForm() {
  const [cleaningType, setCleaningType] = useState<string>("");
  const [customText, setCustomText] = useState("");
  const [address, setAddress] = useState("");
  const [notes, setNotes] = useState("");
  const [scheduledDate, setScheduledDate] = useState("");
  const [scheduledTime, setScheduledTime] = useState("");
  const [result, setResult] = useState<{ success: boolean; message: string } | null>(null);

  const bookCleaning = useMutation(api.cleaning.bookCleaning);

  const selectedType = CLEANING_TYPES.find(t => t.value === cleaningType);
  const totalAmount = selectedType?.basePrice || 0;
  const estimatedDuration = selectedType?.duration || 0;

  const handleSubmit = async () => {
    if (!cleaningType || !address || !scheduledDate || !scheduledTime) {
      setResult({ success: false, message: "Please fill in all required fields" });
      return;
    }

    if (cleaningType === "custom" && !customText) {
      setResult({ success: false, message: "Please describe your custom cleaning requirements" });
      return;
    }

    try {
      const scheduledAt = new Date(`${scheduledDate}T${scheduledTime}`).getTime();

      await bookCleaning({
        type: cleaningType as any,
        customText: cleaningType === "custom" ? customText : undefined,
        scheduledAt,
        address,
        estimatedDuration,
        totalAmount,
        notes: notes || undefined,
      });

      setResult({ 
        success: true, 
        message: "Cleaning service booked successfully!" 
      });

      // Reset form
      setCleaningType("");
      setCustomText("");
      setAddress("");
      setNotes("");
      setScheduledDate("");
      setScheduledTime("");
    } catch (error) {
      setResult({ 
        success: false, 
        message: error instanceof Error ? error.message : "Failed to book cleaning service" 
      });
    }
  };

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <Title order={1} mb="xl" className="text-gray-800">
        Book Cleaning Service
      </Title>

      <Stack gap="lg">
        {/* Service Type Selection */}
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
            <Title order={3} mb="md">Service Type</Title>
            <Select
              placeholder="Select cleaning service type"
              data={CLEANING_TYPES.map(type => ({
                value: type.value,
                label: `${type.label} - $${type.basePrice} (${type.duration}h)`
              }))}
              value={cleaningType}
              onChange={(value) => setCleaningType(value || '')}
              size="lg"
            />
            
            {selectedType && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                className="mt-4 p-4 bg-green-50 rounded-lg border border-green-200"
              >
                <Text fw={500} mb="xs">{selectedType.label}</Text>
                <Text size="sm" c="dimmed" mb="xs">{selectedType.description}</Text>
                <Group>
                  <Text size="sm">
                    <strong>Price:</strong> ${selectedType.basePrice}
                  </Text>
                  <Text size="sm">
                    <strong>Duration:</strong> {selectedType.duration} hours
                  </Text>
                </Group>
              </motion.div>
            )}
          </Card>
        </motion.div>

        {/* Custom Service Details */}
        {cleaningType === "custom" && (
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
              <Title order={3} mb="md">Custom Service Details</Title>
              <Textarea
                label="Describe your cleaning requirements"
                placeholder="Please describe what specific cleaning services you need..."
                value={customText}
                onChange={(e) => setCustomText(e.currentTarget.value)}
                rows={4}
                required
              />
            </Card>
          </motion.div>
        )}

        {/* Address */}
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
            <Title order={3} mb="md">Service Address</Title>
            <TextInput
              label="Full Address"
              placeholder="Enter the address where cleaning service is needed"
              value={address}
              onChange={(e) => setAddress(e.currentTarget.value)}
              required
              size="lg"
            />
          </Card>
        </motion.div>

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
            <Title order={3} mb="md">Schedule Service</Title>
            <Group grow>
              <TextInput
                label="Date"
                type="date"
                value={scheduledDate}
                onChange={(e) => setScheduledDate(e.currentTarget.value)}
                required
              />
              <TextInput
                label="Time"
                type="time"
                value={scheduledTime}
                onChange={(e) => setScheduledTime(e.currentTarget.value)}
                required
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
              placeholder="Any special instructions, access codes, or preferences..."
              value={notes}
              onChange={(e) => setNotes(e.currentTarget.value)}
              rows={3}
            />
          </Card>
        </motion.div>

        {/* Summary & Submit */}
        {selectedType && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
          >
            <Card
              shadow="sm"
              padding="lg"
              radius="md"
              withBorder
              className="bg-blue-50 border-blue-200"
            >
              <Title order={3} mb="md">Booking Summary</Title>
              <Group justify="space-between" mb="md">
                <Text>Service:</Text>
                <Text fw={500}>{selectedType.label}</Text>
              </Group>
              <Group justify="space-between" mb="md">
                <Text>Estimated Duration:</Text>
                <Text fw={500}>{estimatedDuration} hours</Text>
              </Group>
              <Group justify="space-between" mb="lg">
                <Text size="lg" fw={600}>Total Amount:</Text>
                <Text size="lg" fw={600} c="blue">${totalAmount}</Text>
              </Group>
              
              <Button
                size="lg"
                onClick={handleSubmit}
                disabled={!cleaningType || !address || !scheduledDate || !scheduledTime}
                leftSection={<IconSparkles size={20} />}
                className="bg-green-600 hover:bg-green-700"
                fullWidth
              >
                Book Cleaning Service (${totalAmount})
              </Button>
            </Card>
          </motion.div>
        )}

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
