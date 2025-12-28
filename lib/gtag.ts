
declare global {
  interface Window {
    gtag: (
      event: 'event',
      action: string,
      params: { [key: string]: string | number | boolean | undefined }
    ) => void;
  }
}

type GTagEvent = {
  action: string;
  category: string;
  label: string;
  value: number;
};

// https://developers.google.com/analytics/devguides/collection/gtagjs/events
export const event = ({ action, category, label, value }: GTagEvent) => {
  if (typeof window.gtag === 'function') {
    window.gtag('event', action, {
      event_category: category,
      event_label: label,
      value: value,
    });
  }
};

/**
 * --- Suggested Events for Tracking ---
 */

// Event for when a user simplifies text. This is a core action.
export const trackSimplification = (persona: string, inputLength: number) => {
  event({
    action: 'simplify_text',
    category: 'Core',
    label: persona,
    value: inputLength,
  });
};

// Event for when a user copies the result
export const trackCopyResult = (persona: string) => {
  event({
    action: 'copy_result',
    category: 'Engagement',
    label: persona,
    value: 1, // Represents a single copy action
  });
};

// Event for tracking errors, e.g., API failures.
export const trackApiError = (error: string) => {
  event({
    action: 'api_error',
    category: 'Error',
    label: error,
    value: 1, // Represents a single error event
  });
};
