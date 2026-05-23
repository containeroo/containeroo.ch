---
title: "VsphereAgentPool"
description: "Learn how to use the VsphereAgentPool resource"
weight: 10
---

The API specification can be viewed [here](/docs/agent-forge-operator/api_reference/#agent-forge.containeroo.ch/v1alpha1.VsphereAgentPool).

`VsphereAgentPool` is a namespace-scoped bridge between one HyperShift Agent
`NodePool` and vSphere VM inventory.

HyperShift and CAPI remain authoritative. The operator reacts to
`AgentMachine` objects that report `Ready=False` with `Reason=NoSuitableAgents`
by ensuring enough matching Assisted Installer `Agent` objects can exist.

## Example

```yaml
apiVersion: agent-forge.containeroo.ch/v1alpha1
kind: VsphereAgentPool
metadata:
  name: demo-worker
  namespace: demo
spec:
  hostedClusterRef:
    name: demo
  nodePoolRef:
    name: demo-worker
  infraEnvRef:
    name: demo
  controlPlaneNamespace: demo-demo
  cleanupPolicy: Delete
  vsphere:
    credentialsSecretRef:
      name: vsphere-credentials
    datacenter: dc1
    datastoreCluster: workload-datastore-cluster
    isoDatastore: iso-datastore
    resourcePool: cluster/Resources
    folder: demo
    network: VM Network
  template:
    namePrefix: demo-worker
    numCPUs: 4
    memoryMiB: 16384
    diskGiB: 100
  agent:
    role: worker
    approve: true
    labels:
      hypershift.openshift.io/nodepool-role: worker
      customer: example
  iso:
    checkInterval: 10m
    retainVersions: 2
    pathPrefix: agent-forge/demo/demo-worker
```

## Required spec fields

| Field                                    | Description |
| ---------------------------------------- | ----------- |
| `spec.hostedClusterRef.name`             | HostedCluster name in the same namespace as this resource. |
| `spec.nodePoolRef.name`                  | HyperShift NodePool name in the same namespace as this resource. |
| `spec.infraEnvRef.name`                  | Assisted Installer InfraEnv name in the same namespace. |
| `spec.controlPlaneNamespace`             | Hosted control plane namespace containing CAPI `AgentMachine` and `Machine` objects. |
| `spec.vsphere.credentialsSecretRef.name` | Secret containing vSphere `server`, `username`, and `password`. |
| `spec.vsphere.datastoreCluster`          | Datastore cluster for VM disks. |
| `spec.vsphere.isoDatastore`              | Datastore for cached discovery ISOs. |
| `spec.vsphere.resourcePool`              | Resource pool path, for example `cluster/Resources`. |
| `spec.vsphere.network`                   | vSphere network attached to the VM NIC. |
| `spec.agent.labels`                      | Labels required on discovered Agents. These should match the NodePool Agent selector. |

## Important optional spec fields

| Field                                         | Description |
| --------------------------------------------- | ----------- |
| `spec.vsphere.credentialsSecretRef.namespace` | Secret namespace. Defaults to the resource namespace. |
| `spec.vsphere.datacenter`                     | vSphere datacenter name. Defaults to `dc1`. |
| `spec.vsphere.folder`                         | VM folder path. Defaults logically to the hosted cluster name when empty. |
| `spec.vsphere.vmTags`                         | Optional vSphere tag IDs to attach to created VMs. |
| `spec.vsphere.guestID`                        | Guest OS identifier. Defaults to `rhel9_64Guest`. |
| `spec.vsphere.scsiType`                       | SCSI controller type. Defaults to `pvscsi`. |
| `spec.vsphere.firmware`                       | VM firmware, `efi` or `bios`. Defaults to `efi`. |
| `spec.vsphere.networkAdapterType`             | NIC adapter type. Defaults to `vmxnet3`. |
| `spec.template.namePrefix`                    | Prefix for operator-created VM names. |
| `spec.template.numCPUs`                       | VM vCPU count. Defaults to `4`. |
| `spec.template.memoryMiB`                     | VM memory in MiB. Defaults to `16384`. |
| `spec.template.diskGiB`                       | Primary disk size in GiB. Defaults to `100`. |
| `spec.agent.role`                             | Value for `hypershift.openshift.io/nodepool-role`. Defaults to `worker`. |
| `spec.agent.approve`                          | When true, patch matching Agents with `spec.approved=true`. Defaults to `true`. |
| `spec.iso.checkInterval`                      | How often to download and hash the InfraEnv ISO. Defaults to `10m`. |
| `spec.iso.retainVersions`                     | Number of content-addressed ISO objects to keep. Defaults to `2`. |
| `spec.iso.pathPrefix`                         | Datastore directory for cached ISO objects. |
| `spec.cleanupPolicy`                          | `Delete` removes stale owned VMs and unbound Agents. `Retain` leaves them in place. Defaults to `Delete`. |

## Status

`VsphereAgentPool.status` reports observed AgentMachine demand, matching Agent
capacity, owned VM identities, active ISO cache state, planned actions, and
conditions.

The most useful operational fields are:

| Field                              | Description |
| ---------------------------------- | ----------- |
| `status.waitingAgentMachines`      | AgentMachines reporting `Ready=False` and `Reason=NoSuitableAgents`. |
| `status.agentMachinesWithoutAgent` | Unready AgentMachines without an assigned Agent. |
| `status.matchingAgents`            | Agents in the resource namespace matching `spec.agent.labels`. |
| `status.availableAgents`           | Matching Agents not yet bound to CAPI. |
| `status.ownedVMs`                  | VMs created or tracked by this pool, including BIOS UUID, MAC, AgentRef, MachineRef, and phase. |
| `status.iso`                       | Active cached ISO URL, path, SHA256 digest, timestamps, and retained history. |
| `status.plannedActions`            | Latest planned or applied actions. |
| `status.conditions`                | `Ready`, `AgentMachineDemandFound`, `InfraEnvAvailable`, `ISOReady`, `CapacitySatisfied`, and `VsphereReady`. |
