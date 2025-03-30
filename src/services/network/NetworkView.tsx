import { useState, useEffect } from "react";
import { ActionPanel, Action, List, Icon, useNavigation } from "@raycast/api";
import { showFailureToast } from "@raycast/utils";
import VPCView from "./VPCView";
import IPAddressView from "./IPAddressView";
import FirewallRulesView from "./FirewallRulesView";
import { NetworkService } from "./NetworkService";
<<<<<<< HEAD
=======
import ProjectQuickSwitcher from "../../common/ProjectQuickSwitcher";
>>>>>>> 21d012a (v0.2.32)

interface NetworkViewProps {
  projectId: string;
  gcloudPath: string;
}

export default function NetworkView({ projectId, gcloudPath }: NetworkViewProps) {
  const { push } = useNavigation();
  const [isLoading, setIsLoading] = useState<boolean>(true);
<<<<<<< HEAD

  useEffect(() => {
    // Initialize service with provided gcloudPath and projectId
    const networkService = new NetworkService(gcloudPath, projectId);

    // Validate that we can access the network service
    const validateAccess = async () => {
      try {
        // Try to fetch VPCs as a test
        await networkService.getVPCs();
      } catch (error) {
        console.error("Error validating network access:", error);
        showFailureToast(error, {
          title: "Network Service Error",
        });
      } finally {
        setIsLoading(false);
=======
  const [selectedProjectId, setSelectedProjectId] = useState<string>(projectId);
  const [service, setService] = useState<NetworkService | null>(null);

  useEffect(() => {
    const abortController = new AbortController();
    const networkService = new NetworkService(gcloudPath, selectedProjectId);
    setService(networkService);

    const validateAccess = async () => {
      try {
        if (abortController.signal.aborted) return;
        await networkService.getVPCs();
      } catch (error) {
        if (!abortController.signal.aborted) {
          console.error("Error validating network access:", error);
          showFailureToast(error, {
            title: "Network Service Error",
          });
        }
      } finally {
        if (!abortController.signal.aborted) {
          setIsLoading(false);
        }
>>>>>>> 21d012a (v0.2.32)
      }
    };

    validateAccess();
<<<<<<< HEAD
  }, [gcloudPath, projectId]);

  return (
    <List isLoading={isLoading} navigationTitle="Manage Networks" searchBarPlaceholder="Search network services...">
=======

    return () => {
      abortController.abort();
    };
  }, [gcloudPath, selectedProjectId]);

  return (
    <List
      isLoading={isLoading}
      navigationTitle="Manage Networks"
      searchBarPlaceholder="Search network services..."
      searchBarAccessory={
        <ProjectQuickSwitcher projectId={projectId} gcloudPath={gcloudPath} onProjectChange={setSelectedProjectId} />
      }
    >
>>>>>>> 21d012a (v0.2.32)
      <List.Section title="VPC Networks">
        <List.Item
          title="VPC Networks"
          subtitle="Create and manage VPC networks"
          icon={{ source: Icon.Network }}
          accessories={[{ icon: Icon.ChevronRight }]}
          actions={
            <ActionPanel>
              <Action
                title="Open Vpc Networks"
                icon={Icon.Network}
                onAction={() => {
<<<<<<< HEAD
                  push(<VPCView projectId={projectId} gcloudPath={gcloudPath} />);
=======
                  push(<VPCView projectId={selectedProjectId} gcloudPath={gcloudPath} />);
>>>>>>> 21d012a (v0.2.32)
                }}
              />
            </ActionPanel>
          }
        />
      </List.Section>

      <List.Section title="IP Addresses">
        <List.Item
          title="IP Addresses"
          subtitle="Reserve and manage static IP addresses"
          icon={{ source: Icon.Globe }}
          accessories={[{ icon: Icon.ChevronRight }]}
          actions={
            <ActionPanel>
              <Action
                title="Open Ip Addresses"
                icon={Icon.Globe}
                onAction={() => {
<<<<<<< HEAD
                  push(<IPAddressView projectId={projectId} gcloudPath={gcloudPath} />);
=======
                  push(<IPAddressView projectId={selectedProjectId} gcloudPath={gcloudPath} />);
>>>>>>> 21d012a (v0.2.32)
                }}
              />
            </ActionPanel>
          }
        />
      </List.Section>

      <List.Section title="Firewall">
        <List.Item
          title="Firewall Rules"
          subtitle="Create and manage firewall rules"
          icon={{ source: Icon.Shield }}
          accessories={[{ icon: Icon.ChevronRight }]}
          actions={
            <ActionPanel>
              <Action
                title="Open Firewall Rules"
                icon={Icon.Shield}
                onAction={() => {
<<<<<<< HEAD
                  push(<FirewallRulesView projectId={projectId} gcloudPath={gcloudPath} />);
=======
                  push(<FirewallRulesView projectId={selectedProjectId} gcloudPath={gcloudPath} />);
>>>>>>> 21d012a (v0.2.32)
                }}
              />
            </ActionPanel>
          }
        />
      </List.Section>
    </List>
  );
}
