import { render } from '@testing-library/react';
import { ConvexProvider, ConvexReactClient } from 'convex/react';
import { describe, expect, it } from 'vitest';
import App from '../src/App';

// Mock matchMedia
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: (query: any) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: () => {}, // deprecated
    removeListener: () => {}, // deprecated
    addEventListener: () => {},
    removeEventListener: () => {},
    dispatchEvent: () => false,
  }),
});

const convex = new ConvexReactClient("https://happy-animal-123.convex.cloud");

describe('App', () => {
    it('renders without crashing', () => {
        try {
            render(<ConvexProvider client={convex}><App /></ConvexProvider>);
            console.log("APP RENDERED");
            expect(true).toBe(true);
        } catch (e) {
            console.error("APP CRASH", e);
            throw e;
        }
    });
});
