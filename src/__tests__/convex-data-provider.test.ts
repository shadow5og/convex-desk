import { beforeEach, describe, expect, it, vi } from 'vitest';
import { syncOfflineMutations } from '../src/providers/convex-data-provider';

describe('convex-data-provider', () => {
    beforeEach(() => {
        // Mock localStorage
        const store: Record<string, string> = {};
        const mockStorage = {
            getItem: (key: string) => store[key] || null,
            setItem: (key: string, value: string) => { store[key] = value; },
            removeItem: (key: string) => { delete store[key]; },
            clear: () => {}
        };
        Object.defineProperty(window, 'localStorage', { value: mockStorage, writable: true });
        
        // Mock navigator
        Object.defineProperty(window, 'navigator', {
            value: { onLine: true },
            writable: true
        });
    });

    it('syncOfflineMutations processing queue', async () => {
        const mockClient = {
            mutation: vi.fn().mockResolvedValue({ success: true })
        };
        
        // Store a test offline mutation
        window.localStorage.setItem('laundryclean_offline_queue', JSON.stringify([
            { type: 'create', resource: 'laundryOrders', variables: { customer: 'John Doe' } }
        ]));
        
        await syncOfflineMutations(mockClient as any);
        
        expect(mockClient.mutation).toHaveBeenCalledTimes(1);
        const newQueue = JSON.parse(window.localStorage.getItem('laundryclean_offline_queue') || '[]');
        expect(newQueue.length).toBe(0);
    });
});
