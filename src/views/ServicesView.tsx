import React, { useEffect, useState } from "react";
import { ActionPanel, Action, List, Icon, useNavigation, Color, LocalStorage } from "@raycast/api";
import { StorageBucketView } from "../services/storage";
import { IAMView } from "../services/iam";
import { ServiceHubView } from "../services/servicehub";
import { ComputeInstancesView } from "../services/compute";
import { NetworkView } from "../services/network";

interface ServicesViewProps {
  projectId: string;
  gcloudPath: string;
}

interface Service {
  id: string;
  name: string;
  description: string;
  icon: Icon;
}

const AVAILABLE_SERVICES: Service[] = [
  {
    id: "storage",
    name: "Cloud Storage",
    description: "Object storage for companies of all sizes",
    icon: Icon.Box,
  },
  {
    id: "iam",
    name: "Identity and Access Management (IAM)",
    description: "Fine-grained access control and visibility for centrally managing cloud resources",
    icon: Icon.Key,
  },
  {
    id: "compute",
    name: "Compute Engine",
    description: "Virtual machines running in Google's data centers",
    icon: Icon.Desktop,
  },
  {
    id: "network",
    name: "VPC Network",
    description: "Virtual Private Cloud networks, subnets, and firewall rules",
    icon: Icon.Network,
  },
  {
    id: "servicehub",
    name: "Marketplace",
    description: "Centralized service management and discovery platform",
    icon: Icon.Globe,
  },
];

export function ServicesView({ projectId, gcloudPath }: ServicesViewProps) {
  const { push } = useNavigation();

  // State to hold the list of favorite service ids.
  const [favorites, setFavorites] = useState<string[]>([]);

  // When the component mounts, load the favorites from LocalStorage.
  useEffect(() => {
    (async () => {
      const stored = await LocalStorage.getItem<string>("favoriteServices");
      if (stored) {
        try {
          const parsed = JSON.parse(stored) as string[];
          setFavorites(parsed);
        } catch {
          setFavorites([]);
        }
      }
    })();
  }, []);

  // Function to update favorites in both LocalStorage and state.
  const updateFavorites = async (newFavorites: string[]) => {
    setFavorites(newFavorites);
    await LocalStorage.setItem("favoriteServices", JSON.stringify(newFavorites));
  };

  // Toggle favorite status for a service
  const toggleFavorite = async (serviceId: string) => {
    if (favorites.includes(serviceId)) {
      await updateFavorites(favorites.filter((id) => id !== serviceId));
    } else {
      await updateFavorites([...favorites, serviceId]);
    }
  };

  // Navigate to the selected service view
  const handleServiceSelection = (service: Service) => {
    switch (service.id) {
      case "storage":
        push(<StorageBucketView projectId={projectId} gcloudPath={gcloudPath} />);
        break;
      case "iam":
        push(<IAMView projectId={projectId} gcloudPath={gcloudPath} />);
        break;
      case "compute":
        push(<ComputeInstancesView projectId={projectId} gcloudPath={gcloudPath} />);
        break;
      case "network":
        push(<NetworkView projectId={projectId} gcloudPath={gcloudPath} />);
        break;
      case "servicehub":
        push(<ServiceHubView projectId={projectId} gcloudPath={gcloudPath} />);
        break;
    }
  };

  // Split services into favorites and non-favorites
  const favoriteServices = AVAILABLE_SERVICES.filter((s) => favorites.includes(s.id));
  const nonFavoriteServices = AVAILABLE_SERVICES.filter((s) => !favorites.includes(s.id));

  // Render a service item with action items for navigation and toggling favorite
  const renderServiceItem = (service: Service) => {
    const isFavorite = favorites.includes(service.id);
    return (
      <List.Item
        key={service.id}
        title={service.name}
        subtitle={service.description}
        icon={{
          source: service.icon,
          tintColor: isFavorite ? Color.Yellow : Color.Blue,
        }}
        actions={
          <ActionPanel>
            <Action title={`Open ${service.name}`} onAction={() => handleServiceSelection(service)} />
            <Action
              title={isFavorite ? "Unfavorite Service" : "Favorite Service"}
              icon={isFavorite ? Icon.StarDisabled : Icon.Star}
              onAction={() => toggleFavorite(service.id)}
            />
          </ActionPanel>
        }
      />
    );
  };

  return (
    <List>
      {favoriteServices.length > 0 && (
        <List.Section title="Favorites">{favoriteServices.map(renderServiceItem)}</List.Section>
      )}
      <List.Section title="All Services">{nonFavoriteServices.map(renderServiceItem)}</List.Section>
    </List>
  );
}
