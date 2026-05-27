import React, { useRef, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
} from "react-native";
import { Feather } from "@expo/vector-icons";
import { useColors } from "@/hooks/useColors";
import type { Project } from "@/context/AppContext";

interface ProjectsMapViewProps {
  projects: Project[];
  onProjectPress?: (project: Project) => void;
}

/**
 * Mobile map component using a custom map implementation
 * (Without react-native-maps to avoid additional native module dependencies)
 */
export function ProjectsMapView({ projects, onProjectPress }: ProjectsMapViewProps) {
  const colors = useColors();

  // Calculate center and bounds of all projects
  const calculateCenter = () => {
    if (projects.length === 0) return { lat: 17.3850, lng: 78.4867 }; // Default to India center

    const lats = projects.map((p) => p.lat);
    const lngs = projects.map((p) => p.lng);

    return {
      lat: (Math.min(...lats) + Math.max(...lats)) / 2,
      lng: (Math.min(...lngs) + Math.max(...lngs)) / 2,
    };
  };

  const center = calculateCenter();

  return (
    <View style={[styles.container, { backgroundColor: colors.card, borderColor: colors.border }]}>
      {/* Map Header */}
      <View style={styles.mapHeader}>
        <View style={styles.headerContent}>
          <Feather name="map" size={18} color={colors.primary} />
          <Text style={[styles.mapTitle, { color: colors.text }]}>Project Locations</Text>
        </View>
        <Text style={[styles.projectCount, { color: colors.mutedForeground }]}>
          {projects.length} projects
        </Text>
      </View>

      {/* Map Placeholder with Grid Layout */}
      <View style={[styles.mapPlaceholder, { backgroundColor: colors.secondary }]}>
        <View style={styles.gridMap}>
          {/* Stylized map visualization */}
          {projects.map((project, index) => {
            // Calculate position based on coordinates
            const xPos = ((project.lng - 76) / 4) * 100; // Normalize to 0-100
            const yPos = ((project.lat - 15) / 3) * 100; // Normalize to 0-100

            return (
              <TouchableOpacity
                key={project.id}
                style={[
                  styles.mapMarker,
                  {
                    left: `${Math.max(5, Math.min(95, xPos))}%`,
                    top: `${Math.max(5, Math.min(95, yPos))}%`,
                    backgroundColor: colors.primary,
                  },
                ]}
                onPress={() => onProjectPress?.(project)}
              >
                <View style={styles.markerPulse} />
              </TouchableOpacity>
            );
          })}

          {/* Grid overlay */}
          <View style={styles.gridLines}>
            <View style={[styles.gridLine, { backgroundColor: colors.border }]} />
            <View style={[styles.gridLine, { backgroundColor: colors.border }]} />
          </View>
        </View>
      </View>

      {/* Projects List */}
      <View style={styles.projectsList}>
        <Text style={[styles.listTitle, { color: colors.text }]}>Active Projects</Text>
        {projects.length > 0 ? (
          projects.map((project) => (
            <TouchableOpacity
              key={project.id}
              style={[
                styles.projectItem,
                {
                  backgroundColor: colors.background,
                  borderColor: colors.border,
                },
              ]}
              onPress={() => onProjectPress?.(project)}
            >
              <View style={styles.projectItemIcon}>
                <Feather name="map-pin" size={14} color={colors.primary} />
              </View>
              <View style={styles.projectItemContent}>
                <Text style={[styles.projectItemName, { color: colors.text }]}>
                  {project.name}
                </Text>
                <Text style={[styles.projectItemLocation, { color: colors.mutedForeground }]}>
                  {project.location}, {project.state}
                </Text>
              </View>
              <View style={styles.projectItemCoords}>
                <Text style={[styles.coordsText, { color: colors.mutedForeground }]}>
                  {project.lat.toFixed(2)}°, {project.lng.toFixed(2)}°
                </Text>
              </View>
            </TouchableOpacity>
          ))
        ) : (
          <View style={styles.emptyState}>
            <Feather name="inbox" size={32} color={colors.mutedForeground} />
            <Text style={[styles.emptyText, { color: colors.mutedForeground }]}>
              No projects with location data
            </Text>
          </View>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    borderRadius: 12,
    borderWidth: 1,
    overflow: "hidden",
    marginVertical: 12,
  },
  mapHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(0,0,0,0.05)",
  },
  headerContent: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  mapTitle: {
    fontSize: 14,
    fontWeight: "600",
  },
  projectCount: {
    fontSize: 12,
  },
  mapPlaceholder: {
    height: 200,
    position: "relative",
    overflow: "hidden",
  },
  gridMap: {
    flex: 1,
    position: "relative",
  },
  mapMarker: {
    position: "absolute",
    width: 24,
    height: 24,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    marginLeft: -12,
    marginTop: -12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 5,
  },
  markerPulse: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: "#fff",
  },
  gridLines: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: "space-around",
    pointerEvents: "none",
  },
  gridLine: {
    height: 1,
    width: "100%",
  },
  projectsList: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    maxHeight: 300,
  },
  listTitle: {
    fontSize: 13,
    fontWeight: "600",
    marginBottom: 8,
  },
  projectItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 8,
    borderWidth: 1,
    marginBottom: 8,
    gap: 10,
  },
  projectItemIcon: {
    width: 28,
    height: 28,
    borderRadius: 6,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(0,0,0,0.05)",
  },
  projectItemContent: {
    flex: 1,
  },
  projectItemName: {
    fontSize: 13,
    fontWeight: "600",
    marginBottom: 2,
  },
  projectItemLocation: {
    fontSize: 11,
  },
  projectItemCoords: {
    alignItems: "flex-end",
  },
  coordsText: {
    fontSize: 10,
  },
  emptyState: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 24,
    gap: 8,
  },
  emptyText: {
    fontSize: 12,
  },
});
