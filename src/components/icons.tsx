import type { ReactNode } from "react";

function Svg({ size = 18, children }: { size?: number; children: ReactNode }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.7}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      {children}
    </svg>
  );
}

type IconProps = { size?: number };

export const Icon = {
  overview: ({ size }: IconProps) => (
    <Svg size={size}>
      <path d="M4 20V10M10 20V4M16 20v-7M22 20H2" />
    </Svg>
  ),
  bookings: ({ size }: IconProps) => (
    <Svg size={size}>
      <path d="M3 11l9-7 9 7" />
      <path d="M5 10v10h14V10" />
      <path d="M10 20v-5h4v5" />
    </Svg>
  ),
  callbacks: ({ size }: IconProps) => (
    <Svg size={size}>
      <path d="M22 16.9v3a2 2 0 0 1-2.2 2 19.8 19.8 0 0 1-8.6-3.1 19.5 19.5 0 0 1-6-6A19.8 19.8 0 0 1 2.1 4.2 2 2 0 0 1 4.1 2h3a2 2 0 0 1 2 1.7c.1.9.4 1.8.7 2.7a2 2 0 0 1-.5 2.1L8 9.8a16 16 0 0 0 6 6l1.3-1.3a2 2 0 0 1 2.1-.4c.9.3 1.8.6 2.7.7a2 2 0 0 1 1.7 2z" />
    </Svg>
  ),
  subscribers: ({ size }: IconProps) => (
    <Svg size={size}>
      <rect x="3" y="5" width="18" height="14" rx="2" />
      <path d="M3 7l9 6 9-6" />
    </Svg>
  ),
  members: ({ size }: IconProps) => (
    <Svg size={size}>
      <circle cx="12" cy="8" r="4" />
      <path d="M4 21c0-4 4-6 8-6s8 2 8 6" />
    </Svg>
  ),
  teetimes: ({ size }: IconProps) => (
    <Svg size={size}>
      <path d="M6 21V3" />
      <path d="M6 4h11l-2.5 4L17 12H6" />
      <ellipse cx="9" cy="21" rx="5" ry="1" />
    </Svg>
  ),
  content: ({ size }: IconProps) => (
    <Svg size={size}>
      <rect x="3" y="5" width="18" height="16" rx="2" />
      <path d="M3 10h18M8 3v4M16 3v4" />
    </Svg>
  ),
  search: ({ size }: IconProps) => (
    <Svg size={size}>
      <circle cx="11" cy="11" r="7" />
      <path d="M21 21l-4.3-4.3" />
    </Svg>
  ),
  refresh: ({ size }: IconProps) => (
    <Svg size={size}>
      <path d="M21 12a9 9 0 1 1-2.6-6.4" />
      <path d="M21 3v6h-6" />
    </Svg>
  ),
  close: ({ size }: IconProps) => (
    <Svg size={size}>
      <path d="M6 6l12 12M18 6L6 18" />
    </Svg>
  ),
  copy: ({ size }: IconProps) => (
    <Svg size={size}>
      <rect x="9" y="9" width="12" height="12" rx="2" />
      <path d="M5 15V5a2 2 0 0 1 2-2h10" />
    </Svg>
  ),
  download: ({ size }: IconProps) => (
    <Svg size={size}>
      <path d="M12 3v12M7 10l5 5 5-5M4 21h16" />
    </Svg>
  ),
  signout: ({ size }: IconProps) => (
    <Svg size={size}>
      <path d="M15 4h3a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2h-3" />
      <path d="M10 17l-5-5 5-5M5 12h11" />
    </Svg>
  ),
  lock: ({ size }: IconProps) => (
    <Svg size={size}>
      <rect x="4" y="11" width="16" height="10" rx="2" />
      <path d="M8 11V7a4 4 0 0 1 8 0v4" />
    </Svg>
  ),
};
