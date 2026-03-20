import { useCallback, useState } from 'react';

type MessageType = 'success' | 'error' | '';

interface ActionMessageState {
  type: MessageType;
  text: string;
}

export function useActionMessage(timeoutMs = 3000) {
  const [message, setMessage] = useState<ActionMessageState>({ type: '', text: '' });

  const showMessage = useCallback((type: MessageType, text: string) => {
    setMessage({ type, text });

    if (type) {
      window.setTimeout(() => {
        setMessage((current) => (current.text === text ? { type: '', text: '' } : current));
      }, timeoutMs);
    }
  }, [timeoutMs]);

  return {
    message,
    showSuccess: (text: string) => showMessage('success', text),
    showError: (text: string) => showMessage('error', text),
    clearMessage: () => setMessage({ type: '', text: '' }),
  };
}
