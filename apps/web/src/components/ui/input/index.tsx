import React from 'react';
import { tv } from 'tailwind-variants';

const inputStyle = tv({
  base: 'w-full bg-background-50 border border-outline-200 focus:border-primary-500 focus:ring-2 focus:ring-primary-500/15 rounded-2xl px-4 py-3 text-sm text-typography-900 placeholder:text-typography-400 outline-none transition-all',
});

export const Input: React.FC<React.InputHTMLAttributes<HTMLInputElement>> = ({ className, ...props }) => (
  <input className={inputStyle({ class: className })} {...props} />
);

export const Textarea: React.FC<React.TextareaHTMLAttributes<HTMLTextAreaElement>> = ({ className, ...props }) => (
  <textarea className={inputStyle({ class: `min-h-[110px] resize-y ${className || ''}` })} {...props} />
);
