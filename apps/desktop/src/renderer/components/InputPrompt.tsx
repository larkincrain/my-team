import React, { useState, useRef, useEffect } from 'react';
import { useAppStore } from '../store';

interface InputPromptProps {
  taskId: string;
  message: string;
}

export default function InputPrompt({ taskId, message }: InputPromptProps) {
  const { sendTaskInput } = useAppStore();
  const [value, setValue] = useState('');
  const [sending, setSending] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!value.trim()) return;
    setSending(true);
    try {
      await sendTaskInput(taskId, value.trim());
      setValue('');
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="bg-yellow-950 border border-yellow-700 rounded-lg p-4">
      <p className="text-yellow-300 text-sm mb-3">
        <span className="font-medium">Agent needs input: </span>
        {message}
      </p>
      <form onSubmit={handleSubmit} className="flex gap-2">
        <input
          ref={inputRef}
          type="text"
          value={value}
          onChange={(e) => setValue(e.target.value)}
          disabled={sending}
          className="flex-1 bg-gray-800 border border-gray-600 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:ring-2 focus:ring-yellow-500 disabled:opacity-50"
          placeholder="Type your response..."
        />
        <button
          type="submit"
          disabled={!value.trim() || sending}
          className="bg-yellow-600 hover:bg-yellow-700 disabled:opacity-50 text-white px-4 py-2 rounded-lg text-sm font-medium"
        >
          Send
        </button>
      </form>
    </div>
  );
}
