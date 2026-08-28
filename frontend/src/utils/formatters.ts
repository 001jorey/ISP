export const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat('en-KE', {
    style: 'currency',
    currency: 'KES',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(amount).replace('KES', 'KES ');
};

export const formatDuration = (hours: number, lang: 'en' | 'sw' = 'en'): string => {
  if (lang === 'sw') {
    if (hours < 1) {
      const minutes = Math.round(hours * 60);
      return `${minutes} Dakika`;
    }
    if (hours === 1) return 'Saa 1';
    if (hours < 24) return `Masaa ${hours}`;
    if (hours === 24) return 'Siku 1';
    if (hours === 168) return 'Wiki 1';
    if (hours === 720) return 'Mwezi 1 (Siku 30)';
    const days = Math.round(hours / 24);
    return `Siku ${days}`;
  }

  if (hours < 1) {
    const minutes = Math.round(hours * 60);
    return `${minutes} mins`;
  }
  if (hours === 1) return '1 Hour';
  if (hours < 24) return `${hours} Hours`;
  if (hours === 24) return '24 Hours (1 Day)';
  if (hours === 168) return '7 Days (1 Week)';
  if (hours === 720) return '30 Days (1 Month)';
  const days = Math.round(hours / 24);
  return `${days} Days`;
};

export const formatBytes = (bytes: number): string => {
  if (!bytes || bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

export const isValidKenyanPhone = (phone: string): boolean => {
  const clean = phone.replace(/\D/g, '');
  // Matches 07XX..., 01XX..., 2547XX..., 2541XX...
  return (
    /^(?:254|\+254|0)?([71][0-9]{8})$/.test(clean) ||
    /^(?:254|\+254|0)?([7][0-9]{8})$/.test(clean)
  );
};

export const formatKenyanPhone = (phone: string): string => {
  const clean = phone.replace(/\D/g, '');
  if (clean.startsWith('254') && clean.length === 12) {
    return `+254 ${clean.slice(3, 6)} ${clean.slice(6, 9)} ${clean.slice(9)}`;
  }
  if (clean.startsWith('0') && clean.length === 10) {
    return `${clean.slice(0, 4)} ${clean.slice(4, 7)} ${clean.slice(7)}`;
  }
  return phone;
};

export const formatRelativeTime = (dateStr: string): string => {
  try {
    const date = new Date(dateStr);
    const now = new Date();
    const diffSec = Math.floor((now.getTime() - date.getTime()) / 1000);

    if (diffSec < 60) return 'Just now';
    if (diffSec < 3600) return `${Math.floor(diffSec / 60)} mins ago`;
    if (diffSec < 86400) return `${Math.floor(diffSec / 3600)} hours ago`;
    return `${Math.floor(diffSec / 86400)} days ago`;
  } catch {
    return dateStr;
  }
};
