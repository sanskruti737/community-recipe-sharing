const base = {
  width: 20,
  height: 20,
  viewBox: '0 0 24 24',
  fill: 'none',
  stroke: 'currentColor',
  strokeWidth: 1.9,
  strokeLinecap: 'round',
  strokeLinejoin: 'round'
};

export const HeartIcon = ({ filled = false }) => (
  <svg {...base} fill={filled ? 'currentColor' : 'none'} aria-hidden="true">
    <path d="M20.8 4.6a5.5 5.5 0 0 0-7.8 0L12 5.7l-1.1-1.1a5.5 5.5 0 0 0-7.8 7.8l1.1 1.1L12 21l7.7-7.5 1.1-1.1a5.5 5.5 0 0 0 0-7.8Z" />
  </svg>
);

export const StarIcon = ({ filled = false }) => (
  <svg {...base} fill={filled ? 'currentColor' : 'none'} aria-hidden="true">
    <path d="m12 2.8 2.9 5.9 6.5.9-4.7 4.6 1.1 6.5-5.8-3-5.8 3 1.1-6.5L2.6 9.6l6.5-.9L12 2.8Z" />
  </svg>
);

export const ClockIcon = () => (
  <svg {...base} aria-hidden="true"><circle cx="12" cy="12" r="9" /><path d="M12 7v5l3 2" /></svg>
);

export const SearchIcon = () => (
  <svg {...base} aria-hidden="true"><circle cx="11" cy="11" r="7" /><path d="m20 20-3.5-3.5" /></svg>
);

export const PlusIcon = () => (
  <svg {...base} aria-hidden="true"><path d="M12 5v14M5 12h14" /></svg>
);

export const EditIcon = () => (
  <svg {...base} aria-hidden="true"><path d="M12 20h9" /><path d="M16.5 3.5a2.1 2.1 0 0 1 3 3L8 18l-4 1 1-4Z" /></svg>
);

export const TrashIcon = () => (
  <svg {...base} aria-hidden="true"><path d="M3 6h18M8 6V4h8v2m3 0-1 14H6L5 6M10 11v5m4-5v5" /></svg>
);

export const ArrowIcon = () => (
  <svg {...base} aria-hidden="true"><path d="M5 12h14m-6-6 6 6-6 6" /></svg>
);

export const SparkleIcon = () => (
  <svg {...base} aria-hidden="true"><path d="M12 3v4m0 10v4M3 12h4m10 0h4M5.6 5.6l2.8 2.8m7.2 7.2 2.8 2.8m0-12.8-2.8 2.8m-7.2 7.2-2.8 2.8" /></svg>
);

export const UsersIcon = () => (
  <svg {...base} aria-hidden="true"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2M9 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8Zm13 10v-2a4 4 0 0 0-3-3.9M16 3.1a4 4 0 0 1 0 7.8" /></svg>
);
