import React, { useState } from "react";
import { useAdmin } from "../context/AdminContext";
import { uploadToR2 } from "../../../lib/r2";
import {
  DEFAULT_SERVICES_CMS,
  DEFAULT_CAROUSEL_UPPER,
  DEFAULT_CAROUSEL_LOWER,
  SuspendedCarouselManager,
  CoreCapabilitiesManager
} from "./services";

export const CmsServicesPanel: React.FC = () => {
  const { siteConfigs, setSiteConfigs, handleSaveConfig, configSaving, templates } = useAdmin();
  const [uploadingFieldKey, setUploadingFieldKey] = useState<string | null>(null);

  const currentCarouselConfig = siteConfigs["services_carousel_slides"] || {};
  const currentUpperSlides: any[] = Array.isArray(currentCarouselConfig.upperSlides) && currentCarouselConfig.upperSlides.length > 0
    ? currentCarouselConfig.upperSlides
    : DEFAULT_CAROUSEL_UPPER;
  const currentLowerSlides: any[] = Array.isArray(currentCarouselConfig.lowerSlides) && currentCarouselConfig.lowerSlides.length > 0
    ? currentCarouselConfig.lowerSlides
    : DEFAULT_CAROUSEL_LOWER;

  const handleUpdateCarouselTrack = (isUpperTrack: boolean, updatedList: any[]) => {
    const nextConfig = {
      ...currentCarouselConfig,
      upperSlides: isUpperTrack ? updatedList : currentUpperSlides,
      lowerSlides: isUpperTrack ? currentLowerSlides : updatedList,
    };
    setSiteConfigs({
      ...siteConfigs,
      services_carousel_slides: nextConfig,
    });
  };

  const handleSaveCarouselSlides = () => {
    handleSaveConfig("services_carousel_slides", {
      upperSlides: currentUpperSlides,
      lowerSlides: currentLowerSlides,
    });
  };

  const currentServicesMap: Record<string, any> = siteConfigs["services_cms"] && Object.keys(siteConfigs["services_cms"]).length > 0
    ? siteConfigs["services_cms"]
    : DEFAULT_SERVICES_CMS;

  const handleAddService = () => {
    const newKey = `service_${Date.now()}`;
    const newService = {
      id: newKey,
      title: "New Presentation Service",
      tagline: "High-impact presentation design tailored to your strategic goals.",
      turnaround: "24h – 48h",
      idealFor: "Founders, executives, and enterprise teams",
      beforeImg: "",
      afterImg: "",
      beforeTitle: "Raw Draft / Before",
      afterTitle: "SlideBee Redesign / After"
    };
    setSiteConfigs({
      ...siteConfigs,
      services_cms: {
        ...currentServicesMap,
        [newKey]: newService
      }
    });
  };

  const handleRemoveService = (serviceKey: string) => {
    const updated = { ...currentServicesMap };
    delete updated[serviceKey];
    setSiteConfigs({
      ...siteConfigs,
      services_cms: updated
    });
  };

  const handleUpdateServiceField = (serviceKey: string, field: string, val: string) => {
    setSiteConfigs({
      ...siteConfigs,
      services_cms: {
        ...currentServicesMap,
        [serviceKey]: {
          ...(currentServicesMap[serviceKey] || {}),
          [field]: val
        }
      }
    });
  };

  const handleServiceImageUpload = async (
    serviceKey: string,
    field: "beforeImg" | "afterImg",
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const keyTag = `svc_${field}_${serviceKey}`;
    setUploadingFieldKey(keyTag);
    try {
      const res = await uploadToR2(file, { folder: "before_after" });
      if (res.success && res.publicUrl) {
        setSiteConfigs({
          ...siteConfigs,
          services_cms: {
            ...currentServicesMap,
            [serviceKey]: {
              ...(currentServicesMap[serviceKey] || {}),
              [field]: res.publicUrl,
            },
          },
        });
      }
    } catch (err) {
      console.warn("Service image upload failed:", err);
    } finally {
      setUploadingFieldKey(null);
      if (e.target) e.target.value = "";
    }
  };

  const handleSaveServices = () => {
    handleSaveConfig("services_cms", siteConfigs["services_cms"] || currentServicesMap);
  };

  return (
    <div className="space-y-8">
      {/* SECTION 1: SUSPENDED 3D CAROUSEL MARQUEE SLIDE SELECTION */}
      <SuspendedCarouselManager
        currentUpperSlides={currentUpperSlides}
        currentLowerSlides={currentLowerSlides}
        onSaveCarouselSlides={handleSaveCarouselSlides}
        configSaving={configSaving}
        templates={templates}
        onUpdateCarouselTrack={handleUpdateCarouselTrack}
      />

      {/* SECTION 2: 6 CORE CAPABILITIES & INTERACTIVE BEFORE/AFTER SHOWCASE */}
      <CoreCapabilitiesManager
        currentServicesMap={currentServicesMap}
        onSaveServices={handleSaveServices}
        configSaving={configSaving}
        onAddService={handleAddService}
        onRemoveService={handleRemoveService}
        onUpdateServiceField={handleUpdateServiceField}
        onServiceImageUpload={handleServiceImageUpload}
        uploadingFieldKey={uploadingFieldKey}
      />
    </div>
  );
};

export default CmsServicesPanel;
