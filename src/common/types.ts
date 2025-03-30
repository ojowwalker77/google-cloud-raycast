import { Icon } from "@raycast/api";

// Base Types
export interface BaseViewProps {
  projectId: string;
  gcloudPath: string;
  resourceName?: string;
  resourceType?: string;
}

// Project Types
export interface ProjectViewProps extends BaseViewProps {
  projectId: string;
  gcloudPath: string;
}

export interface ProjectDetails {
  projectId: string;
  name: string;
  projectNumber: string;
  createTime?: string;
}

export interface CachedProjectViewProps {
  gcloudPath: string;
  onLoginWithDifferentAccount?: () => void;
}

export interface Service {
  id: string;
  name: string;
  description: string;
  icon: Icon;
}

// Compute Types
export interface ComputeInstance {
  id: string;
  name: string;
  status: string;
  machineType: string;
  zone: string;
  networkInterfaces: NetworkInterface[];
  disks: AttachedDisk[];
  metadata?: { items: MetadataItem[] };
  serviceAccounts?: ServiceAccount[];
  creationTimestamp: string;
}

export interface NetworkInterface {
  network: string;
  subnetwork: string;
  networkIP: string;
  accessConfigs?: Array<{
    natIP?: string;
    type: string;
    name: string;
  }>;
}

export interface AttachedDisk {
  boot: boolean;
  autoDelete: boolean;
  deviceName: string;
  interface?: string;
  source: string;
}

export interface Disk {
  id: string;
  name: string;
  sizeGb: string;
  status: string;
  type: string;
  zone: string;
  users?: string[];
  lastAttachTimestamp?: string;
  creationTimestamp: string;
}

export interface MetadataItem {
  key: string;
  value: string;
}

export interface ServiceAccount {
  email: string;
  scopes: string[];
}

export interface MachineType {
  name: string;
  description: string;
}

// IAM Types
export interface IAMPrincipal {
  type: string;
  email: string;
  displayName?: string;
  roles: IAMRole[];
}

export interface IAMRole {
  name: string;
  title: string;
  description: string;
  custom?: boolean;
}

export interface IAMCondition {
  title: string;
  description: string;
  expression: string;
}

export interface IAMBinding {
  role: string;
  members: string[];
  condition?: IAMCondition;
}

export interface IAMPolicy {
  version: number;
  bindings: IAMBinding[];
  etag: string;
}

export interface IAMServiceAccount {
  name: string;
  email: string;
  displayName?: string;
  description?: string;
  disabled?: boolean;
}

export interface IAMCustomRole {
  name: string;
  title: string;
  description: string;
  includedPermissions: string[];
  stage: string;
  etag: string;
}

// Storage Types
export interface GCSObject {
  name: string;
  size: string;
  contentType: string;
  updated: string;
  generation: string;
  metageneration: string;
}

export interface GCSBucket {
  name: string;
  location: string;
  storageClass: string;
}

export interface StorageStats {
  totalSize: number;
  objectCount: number;
  lastUpdated: string;
}

export interface StorageObject {
  name: string;
  size: string;
  contentType: string;
  updated: string;
  generation: string;
  metageneration: string;
}

export interface ObjectVersion {
  name: string;
  generation: string;
  size: string;
  updated: string;
  metageneration: string;
  contentType: string;
  timeCreated: string;
  timeDeleted?: string;
}

// Service Hub Types
export interface GCPService {
  name: string;
  title: string;
  description?: string;
  state: string;
  config?: {
    name: string;
    title: string;
    documentation?: {
      summary?: string;
    };
  };
}

export interface ServiceEnableOptions {
  async?: boolean;
  wait?: boolean;
}

export interface ServiceListOptions {
  filter?: string;
  enabled?: boolean;
}

// Preferences
export interface Preferences {
  gcloudPath: string;
  cacheLimit: number;
  authCacheDuration: number;
}

export interface CommandPreferences {
  projectId?: string;
}

// Form Types
export interface FormValues {
  role: string;
  member: string;
}

export interface CommandOptions {
  dryRun?: boolean;
  format?: string;
}

// Cache Types
export interface CacheEntry<T = unknown> {
  timestamp: number;
  data: T;
}
