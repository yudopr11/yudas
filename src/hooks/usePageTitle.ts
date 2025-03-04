import { useEffect } from 'react';

/**
 * Hook untuk mengatur judul halaman
 * @param title Judul yang akan ditampilkan
 * @param suffix Suffix untuk judul (opsional), default: "Yudas CMS"
 */
export const usePageTitle = (title: string, suffix: string = "Yudas CMS") => {
  useEffect(() => {
    // Mengatur judul halaman dengan format: [Title] | [Suffix]
    const formattedTitle = title ? `${title} | ${suffix}` : suffix;
    document.title = formattedTitle;
    
    // Cleanup ketika komponen unmount
    return () => {
      document.title = suffix;
    };
  }, [title, suffix]);
};

export default usePageTitle; 