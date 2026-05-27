import React, { useEffect, useRef } from "react";
import type { Project } from "@/context/AppContext";

interface ProjectsMapViewProps {
  projects: Project[];
  onProjectPress?: (project: Project) => void;
}

/**
 * Web map component using Leaflet
 * Displays project locations on an interactive map
 */
export function ProjectsMapView({ projects, onProjectPress }: ProjectsMapViewProps) {
  const mapContainer = useRef<HTMLDivElement>(null);
  const mapInstance = useRef<any>(null);

  useEffect(() => {
    // Dynamically load Leaflet CSS and JS
    const loadLeaflet = async () => {
      if (typeof window === "undefined" || !mapContainer.current) return;

      // Load Leaflet CSS
      if (!document.getElementById("leaflet-css")) {
        const link = document.createElement("link");
        link.id = "leaflet-css";
        link.rel = "stylesheet";
        link.href = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.css";
        document.head.appendChild(link);
      }

      // Load Leaflet JS
      if (!window.L) {
        const script = document.createElement("script");
        script.src = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.js";
        script.onload = initializeMap;
        document.body.appendChild(script);
      } else {
        initializeMap();
      }
    };

    const initializeMap = () => {
      if (!mapContainer.current || !window.L) return;

      // Create map instance
      const L = window.L;

      // Calculate center from projects
      const getCenterCoords = () => {
        const valid = projects.filter((p) => p.lat != null && p.lng != null);
        if (valid.length === 0) return [17.3850, 78.4867];
        const lats = valid.map((p) => p.lat);
        const lngs = valid.map((p) => p.lng);
        return [
          (Math.min(...lats) + Math.max(...lats)) / 2,
          (Math.min(...lngs) + Math.max(...lngs)) / 2,
        ] as [number, number];
      };

      const center = getCenterCoords();

      // Remove existing map if it exists
      if (mapInstance.current) {
        mapInstance.current.remove();
      }

      // Create new map
      mapInstance.current = L.map(mapContainer.current).setView(center, 6);

      // Add tile layer
      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution: '© OpenStreetMap contributors',
        maxZoom: 19,
      }).addTo(mapInstance.current);

      // Add markers for each project
      projects.filter((p) => p.lat != null && p.lng != null).forEach((project) => {
        const marker = L.circleMarker([project.lat, project.lng], {
          radius: 8,
          fillColor: "#2563eb",
          color: "#1e40af",
          weight: 2,
          opacity: 0.8,
          fillOpacity: 0.8,
        });

        marker.bindPopup(`
          <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; padding: 8px;">
            <strong style="font-size: 13px; display: block; margin-bottom: 4px;">${project.name}</strong>
            <span style="font-size: 12px; color: #666; display: block; margin-bottom: 2px;">📍 ${project.location}, ${project.state}</span>
            <span style="font-size: 12px; color: #666; display: block;">Progress: ${project.progress}%</span>
          </div>
        `);

        marker.addTo(mapInstance.current);

        marker.on("click", () => {
          onProjectPress?.(project);
        });
      });

      // Fit bounds to show all markers
      const validProjects = projects.filter((p) => p.lat != null && p.lng != null);
      if (validProjects.length > 0) {
        const bounds = L.latLngBounds(validProjects.map((p) => [p.lat, p.lng]));
        mapInstance.current.fitBounds(bounds, { padding: [50, 50] });
      }
    };

    loadLeaflet();

    return () => {
      if (mapInstance.current) {
        mapInstance.current.remove();
        mapInstance.current = null;
      }
    };
  }, [projects, onProjectPress]);

  return (
    <div
      style={{
        border: "1px solid #e5e7eb",
        borderRadius: "12px",
        overflow: "hidden",
        marginTop: "16px",
        marginBottom: "16px",
      }}
    >
      {/* Map Header */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "12px 16px",
          borderBottom: "1px solid #e5e7eb",
          backgroundColor: "#f9fafb",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
          <span style={{ fontSize: "18px" }}>🗺️</span>
          <span style={{ fontSize: "14px", fontWeight: "600", color: "#1f2937" }}>Project Locations</span>
        </div>
        <span style={{ fontSize: "12px", color: "#6b7280" }}>{projects.length} projects</span>
      </div>

      {/* Map Container */}
      <div
        ref={mapContainer}
        style={{
          width: "100%",
          height: "300px",
          backgroundColor: "#f0f9ff",
        }}
      />

      {/* Projects List */}
      <div style={{ padding: "12px 16px", borderTop: "1px solid #e5e7eb" }}>
        <div style={{ fontSize: "13px", fontWeight: "600", color: "#1f2937", marginBottom: "8px" }}>
          Active Projects
        </div>

        {projects.length > 0 ? (
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              gap: "8px",
              maxHeight: "300px",
              overflowY: "auto",
            }}
          >
            {projects.map((project) => (
              <div
                key={project.id}
                onClick={() => onProjectPress?.(project)}
                style={{
                  display: "flex",
                  alignItems: "center",
                  padding: "10px 12px",
                  border: "1px solid #e5e7eb",
                  borderRadius: "8px",
                  backgroundColor: "#fff",
                  cursor: "pointer",
                  transition: "all 0.2s",
                  gap: "10px",
                }}
                onMouseOver={(e) => {
                  e.currentTarget.style.backgroundColor = "#f3f4f6";
                  e.currentTarget.style.borderColor = "#2563eb";
                }}
                onMouseOut={(e) => {
                  e.currentTarget.style.backgroundColor = "#fff";
                  e.currentTarget.style.borderColor = "#e5e7eb";
                }}
              >
                <div
                  style={{
                    width: "28px",
                    height: "28px",
                    borderRadius: "6px",
                    backgroundColor: "#f3f4f6",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: "14px",
                  }}
                >
                  📍
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: "13px", fontWeight: "600", color: "#1f2937", marginBottom: "2px" }}>
                    {project.name}
                  </div>
                  <div style={{ fontSize: "11px", color: "#6b7280" }}>
                    {project.location}, {project.state}
                  </div>
                </div>
                <div style={{ textAlign: "right" }}>
                  <div style={{ fontSize: "10px", color: "#6b7280" }}>
                    {project.lat != null ? `${project.lat.toFixed(2)}°` : "—"}, {project.lng != null ? `${project.lng.toFixed(2)}°` : "—"}
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div
            style={{
              textAlign: "center",
              padding: "24px",
              color: "#9ca3af",
              fontSize: "12px",
            }}
          >
            <div style={{ fontSize: "32px", marginBottom: "8px" }}>📭</div>
            No projects with location data
          </div>
        )}
      </div>
    </div>
  );
}

// Type augmentation for Leaflet
declare global {
  interface Window {
    L: any;
  }
}
