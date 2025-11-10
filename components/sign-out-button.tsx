'use client';

import { useFormStatus } from 'react-dom';
import type { ButtonHTMLAttributes } from 'react';

const BASE_CLASSES = [
  'inline-flex items-center justify-center rounded-2xl px-4 py-2 text-sm font-medium',
  'transition-all duration-200 ease-out focus-visible:outline focus-visible:outline-2',
  'focus-visible:outline-offset-2 focus-visible:outline-slate-400 disabled:cursor-not-allowed',
  'active:scale-95 active:shadow-inner',
].join(' ');

const IDLE_CLASSES = [
  'bg-white text-slate-600 shadow-sm ring-1 ring-slate-200',
  'hover:bg-slate-100 hover:text-slate-800 hover:ring-slate-300',
].join(' ');

const PENDING_CLASSES = [
  'scale-105 bg-slate-900 text-white ring-1 ring-slate-900 shadow-lg',
  'disabled:text-white',
].join(' ');

type SignOutButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  label?: string;
  pendingLabel?: string;
};

export function SignOutButton({
  label = 'Sign out',
  pendingLabel = 'Signing out…',
  className = '',
  disabled,
  ...rest
}: SignOutButtonProps) {
  const { pending } = useFormStatus();
  const stateClasses = pending ? PENDING_CLASSES : IDLE_CLASSES;

  return (
    <button
      type="submit"
      {...rest}
      disabled={pending || disabled}
      data-pending={pending ? 'true' : 'false'}
      className={[BASE_CLASSES, stateClasses, className].filter(Boolean).join(' ')}
    >
      {pending ? pendingLabel : label}
    </button>
  );
}
