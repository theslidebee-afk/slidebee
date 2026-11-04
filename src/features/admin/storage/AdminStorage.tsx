import React from "react";
import { useAdmin } from "../context/AdminContext";
import { deleteFromR2 } from "../../../lib/r2";
import { StorageTelemetryPanel } from "./StorageTelemetryPanel";
import { StorageTemplatesTable } from "./StorageTemplatesTable";
import { StorageBucketExplorer } from "./StorageBucketExplorer";

export const AdminStorage: React.FC = () => {
  const { 
    templates, 
    storageStats, 
    setStorageStats,
    openEditTemplateModal 
  } = useAdmin();

  // Delete an object from Cloudflare R2
  const handleDeleteR2Object = async (key: string) => {
    if (!confirm(`Are you sure you want to delete "${key}" from Cloudflare R2?`)) return;
    const ok = await deleteFromR2(key);
    if (ok) {
      setStorageStats((prev) => ({
        ...prev,
        objects: prev.objects.filter((o) => o.key !== key),
        totalFiles: Math.max(0, prev.totalFiles - 1),
      }));
    } else {
      alert("Failed to delete object from Cloudflare R2");
    }
  };

  return (
    <div className="space-y-8">
      {/* Telemetry and zero-cost billing stats */}
      <StorageTelemetryPanel storageStats={storageStats} />

      {/* SECTION 1: TEMPLATES TABLE DATABASE AUDIT */}
      <StorageTemplatesTable
        templates={templates}
        openEditTemplateModal={openEditTemplateModal}
      />

      {/* SECTION 2: LIVE CLOUDFLARE R2 BUCKET EXPLORER */}
      <StorageBucketExplorer
        storageStats={storageStats}
        setStorageStats={setStorageStats}
        onDeleteObject={handleDeleteR2Object}
      />
    </div>
  );
};
