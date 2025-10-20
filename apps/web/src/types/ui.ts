/**
 * UI Component Types
 * Type definitions for reusable UI components
 */

// Loading States
export interface LoadingSkeletonProps {
  lines?: number;
  width?: string | number;
  height?: string | number;
  className?: string;
  animate?: boolean;
}

export interface LoadingCardProps {
  title?: boolean | string;
  content?: boolean;
  actions?: boolean;
  items?: number;
  className?: string;
}

// Stats Card
export interface StatsCardProps {
  title: string;
  value: string | number;
  description?: string;
  icon?: React.ComponentType<{ className?: string }>;
  isLoading?: boolean;
  color?: 'blue' | 'green' | 'orange' | 'purple' | 'red';
  change?: {
    value: number;
    type: 'increase' | 'decrease';
  };
}

// Page Header
export interface PageHeaderProps {
  title: string;
  description?: string;
  actions?: React.ReactNode;
  breadcrumbs?: Array<{
    label: string;
    href?: string;
  }>;
}

// Navigation Types
export interface TabNavigationProps {
  tabs: Array<{
    id: string;
    label: string;
    href?: string;
    count?: number;
    icon?: React.ComponentType<{ className?: string }>;
  }>;
  activeTab: string;
  onTabChange: (tabId: string) => void;
}

// Form Components
export interface FormFieldProps {
  label: string;
  name: string;
  required?: boolean;
  error?: string;
  description?: string;
  children: React.ReactNode;
}

export interface SearchInputProps {
  placeholder?: string;
  value: string;
  onChange: (value: string) => void;
  onSubmit?: (value: string) => void;
  loading?: boolean;
  suggestions?: string[];
}

// Data Table Types
export interface TableColumn<T> {
  key: keyof T;
  label: string;
  sortable?: boolean;
  render?: (value: T[keyof T], row: T) => React.ReactNode;
  className?: string;
}

export interface DataTableProps<T> {
  data: T[];
  columns: TableColumn<T>[];
  loading?: boolean;
  pagination?: {
    page: number;
    limit: number;
    total: number;
    onPageChange: (page: number) => void;
  };
  sorting?: {
    column: keyof T;
    direction: 'asc' | 'desc';
    onSort: (column: keyof T, direction: 'asc' | 'desc') => void;
  };
  selection?: {
    selectedRows: string[];
    onSelectionChange: (selectedRows: string[]) => void;
  };
}

// Modal and Dialog Types
export interface ModalProps {
  open: boolean;
  onClose: () => void;
  title?: string;
  description?: string;
  children: React.ReactNode;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  closable?: boolean;
}

export interface ConfirmDialogProps {
  open: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  description: string;
  confirmText?: string;
  cancelText?: string;
  variant?: 'default' | 'destructive';
}

// Progress and Status
export interface ProgressBarProps {
  value: number;
  max?: number;
  label?: string;
  showPercentage?: boolean;
  size?: 'sm' | 'md' | 'lg';
  variant?: 'default' | 'success' | 'warning' | 'error';
}

export interface StatusBadgeProps {
  status: string;
  variant?: 'default' | 'success' | 'warning' | 'error' | 'info';
  size?: 'sm' | 'md' | 'lg';
  pulse?: boolean;
}

// Chart Types
export interface ChartDataPoint {
  label: string;
  value: number;
  color?: string;
}

export interface LineChartProps {
  data: Array<{
    x: string | number;
    y: number;
  }>;
  title?: string;
  xAxisLabel?: string;
  yAxisLabel?: string;
  color?: string;
  height?: number;
}

export interface BarChartProps {
  data: ChartDataPoint[];
  title?: string;
  orientation?: 'horizontal' | 'vertical';
  height?: number;
}

export interface PieChartProps {
  data: ChartDataPoint[];
  title?: string;
  showLegend?: boolean;
  height?: number;
}

// File Upload
export interface FileUploadProps {
  accept?: string;
  multiple?: boolean;
  maxSize?: number;
  onUpload: (files: File[]) => void;
  onError?: (error: string) => void;
  loading?: boolean;
  disabled?: boolean;
}

// Notification Types
export interface NotificationProps {
  type: 'success' | 'error' | 'warning' | 'info';
  title: string;
  message?: string;
  duration?: number;
  action?: {
    label: string;
    onClick: () => void;
  };
  onDismiss?: () => void;
}