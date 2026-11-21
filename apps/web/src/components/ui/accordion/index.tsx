import React from 'react';
import { tv } from 'tailwind-variants';

const accordionItemStyle = tv({
  base: 'bg-background-0 border rounded-2xl overflow-hidden transition-all shadow-xs',
  variants: {
    isOpen: {
      true: 'border-primary-500/50 shadow-sm',
      false: 'border-outline-200 hover:border-outline-300',
    },
  },
});

export const Accordion: React.FC<React.HTMLAttributes<HTMLDivElement>> = ({ className = '', ...props }) => (
  <div className={`space-y-3 ${className}`} {...props} />
);

export const AccordionItem: React.FC<React.HTMLAttributes<HTMLDivElement> & { isOpen?: boolean }> = ({
  isOpen = false,
  className,
  ...props
}) => <div className={accordionItemStyle({ isOpen, class: className })} {...props} />;

export const AccordionTrigger: React.FC<React.ButtonHTMLAttributes<HTMLButtonElement>> = ({
  className = '',
  ...props
}) => (
  <button
    type="button"
    className={`w-full px-6 py-4 text-left flex items-center justify-between gap-4 font-bold text-typography-900 hover:text-primary-500 transition-colors ${className}`}
    {...props}
  />
);

export const AccordionContent: React.FC<React.HTMLAttributes<HTMLDivElement>> = ({ className = '', ...props }) => (
  <div
    className={`px-6 pb-5 pt-2 text-xs sm:text-sm text-typography-600 leading-relaxed border-t border-outline-100 animate-fadeIn ${className}`}
    {...props}
  />
);
