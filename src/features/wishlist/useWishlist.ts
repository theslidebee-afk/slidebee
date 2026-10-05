import { useState, useEffect, useCallback } from "react";

const WISHLIST_STORAGE_KEY = "slidebee_wishlist";

export function useWishlist() {
  const [wishlistIds, setWishlistIds] = useState<string[]>(() => {
    try {
      const stored = localStorage.getItem(WISHLIST_STORAGE_KEY);
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  });

  const [showAuthModal, setShowAuthModal] = useState<boolean>(false);

  // Sync with localStorage
  useEffect(() => {
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === WISHLIST_STORAGE_KEY && e.newValue) {
        try {
          setWishlistIds(JSON.parse(e.newValue));
        } catch {
          // ignore
        }
      }
    };
    window.addEventListener("storage", handleStorageChange);
    return () => window.removeEventListener("storage", handleStorageChange);
  }, []);

  const isWishlisted = useCallback(
    (templateId: string | number) => {
      return wishlistIds.includes(String(templateId));
    },
    [wishlistIds]
  );

  const toggleWishlist = useCallback(
    (templateId: string | number) => {
      const clientUserStr = localStorage.getItem("slidebee_client_user");
      if (!clientUserStr) {
        // User not logged in: trigger login workflow modal
        setShowAuthModal(true);
        return false;
      }

      const idStr = String(templateId);
      setWishlistIds((prev) => {
        let updated: string[];
        if (prev.includes(idStr)) {
          updated = prev.filter((id) => id !== idStr);
        } else {
          updated = [...prev, idStr];
        }
        try {
          localStorage.setItem(WISHLIST_STORAGE_KEY, JSON.stringify(updated));
          // Dispatch custom event for real-time in-page sync across components
          window.dispatchEvent(new Event("slidebee_wishlist_updated"));
        } catch {
          // ignore
        }
        return updated;
      });

      return true;
    },
    []
  );

  useEffect(() => {
    const handleCustomUpdate = () => {
      try {
        const stored = localStorage.getItem(WISHLIST_STORAGE_KEY);
        if (stored) {
          setWishlistIds(JSON.parse(stored));
        }
      } catch {
        // ignore
      }
    };
    window.addEventListener("slidebee_wishlist_updated", handleCustomUpdate);
    return () => window.removeEventListener("slidebee_wishlist_updated", handleCustomUpdate);
  }, []);

  return {
    wishlistIds,
    isWishlisted,
    toggleWishlist,
    showAuthModal,
    setShowAuthModal,
  };
}
