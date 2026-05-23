---
title: "Get Started"
description: "Get started with agent-forge-operator"
weight: 20
---

This tutorial walks through a first `VsphereAgentPool` and active VM
reconciliation.

## Before you begin

The following prerequisites are required:

- A Kubernetes or OpenShift management cluster with agent-forge-operator installed.
- HyperShift and Assisted Installer resources.
- A hosted cluster that uses the Agent platform.
- A `NodePool` for the hosted cluster.
- CAPI `AgentMachine` and `Machine` objects rendered for that NodePool in the hosted control plane namespace.
- An `InfraEnv` in the hosted cluster namespace with `status.isoDownloadURL` populated.
- vSphere credentials that can upload the discovery ISO, create VMs, power on VMs, and destroy operator-owned VMs.

The examples use these names:

| Value                 | Meaning                                                                    |
| --------------------- | -------------------------------------------------------------------------- |
| `demo`                | Hosted cluster namespace and HostedCluster name.                           |
| `demo-worker`         | NodePool name and `VsphereAgentPool` name.                                 |
| `demo-demo`           | Hosted control plane namespace containing CAPI AgentMachines and Machines. |
| `vsphere-credentials` | Secret with vSphere credentials.                                           |

Adjust the names for your environment.

## Confirm AgentMachine demand

The operator watches CAPI `AgentMachine` objects that HyperShift/CAPI created
for the NodePool. It creates VMs only when an AgentMachine reports
`Ready=False` with `Reason=NoSuitableAgents`.

List AgentMachines in the hosted control plane namespace:

```bash
kubectl -n demo-demo get agentmachines.capi-provider.agent-install.openshift.io
```

Inspect AgentMachines that belong to the NodePool:

```bash
kubectl -n demo-demo get agentmachines.capi-provider.agent-install.openshift.io -o yaml \
  | yq '.items[] | select(.metadata.annotations."hypershift.openshift.io/nodePool" == "demo/demo-worker") | .metadata.name'
```

## Confirm the InfraEnv

The `InfraEnv` must expose a discovery ISO URL:

```bash
kubectl -n demo get infraenv demo -o jsonpath='{.status.isoDownloadURL}{"\n"}'
```

If the value is empty, fix the InfraEnv before enabling active reconciliation.
The operator cannot create bootable discovery VMs without that ISO URL.

## Create the vSphere Secret

Create a Secret in the same namespace as the `VsphereAgentPool`:

```bash
kubectl -n demo create secret generic vsphere-credentials \
  --from-literal=server='vcenter.example.com' \
  --from-literal=username='administrator@example.com' \
  --from-literal=password='<password>' \
  --from-literal=insecure='false'
```

Required keys:

| Key        | Description                                        |
| ---------- | -------------------------------------------------- |
| `server`   | vCenter server hostname or URL accepted by `govc`. |
| `username` | vSphere username.                                  |
| `password` | vSphere password.                                  |
| `insecure` | Optional. Set to `true` to skip certificate verification. |

To keep the Secret in another namespace, set
`spec.vsphere.credentialsSecretRef.namespace`.

## Create a VsphereAgentPool

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
    guestID: rhel9_64Guest
    scsiType: pvscsi
    firmware: efi
    networkAdapterType: vmxnet3
  template:
    namePrefix: demo-worker
    numCPUs: 4
    memoryMiB: 16384
    diskGiB: 100
  agent:
    role: worker
    approve: true
    labels:
      agentclusterinstalls.extensions.hive.openshift.io/location: lab-a
      customer: example
      hypershift.openshift.io/nodepool-role: worker
  iso:
    checkInterval: 10m
    retainVersions: 2
    pathPrefix: agent-forge/demo/demo-worker
```

Apply it:

```bash
kubectl apply -f vsphereagentpool.yaml
```

## Inspect the plan

Check the resource summary:

```bash
kubectl -n demo get vsphereagentpool
kubectl -n demo describe vsphereagentpool demo-worker
```

Inspect status:

```bash
kubectl -n demo get vsphereagentpool demo-worker -o yaml
```

Useful status fields:

| Field                              | What to check |
| ---------------------------------- | ------------- |
| `status.waitingAgentMachines`      | AgentMachines currently reporting `Ready=False` and `Reason=NoSuitableAgents`. |
| `status.agentMachinesWithoutAgent` | Unready AgentMachines without an assigned Agent. |
| `status.matchingAgents`            | Agents that already match `spec.agent.labels`. |
| `status.availableAgents`           | Matching Agents that are not yet bound to CAPI. |
| `status.ownedVMs[*].biosUUID`      | vSphere BIOS UUID used to match discovered Agents to their VMs. |
| `status.ownedVMs[*].macAddress`    | Primary VM NIC MAC used as fallback Agent-to-VM identity. |
| `status.iso.path`                  | Active content-addressed ISO datastore path used for new VMs. |
| `status.plannedActions`            | Planned `CreateVM`, `DeleteVM`, `DeleteAgent`, `PatchAgent`, or `Noop` actions. |
| `status.conditions`                | Readiness, demand, InfraEnv, ISO cache, and vSphere state. |

Check Events:

```bash
kubectl -n demo get events --field-selector involvedObject.name=demo-worker --sort-by=.lastTimestamp
```

## Reconciliation behavior

The operator will:

- Download and hash the InfraEnv discovery ISO when the cache is stale.
- Upload a content-addressed ISO only when the bytes changed or the datastore object is missing.
- Create VMs when AgentMachine demand exceeds available matching Agents.
- Record created VM identity from vSphere.
- Power on created VMs.
- Match discovered Agents to owned VMs by BIOS UUID or MAC before assigning the Agent hostname.
- Patch matching Agents with labels, role, approval, and VM-name hostname when configured.
- Delete owned VMs and stale unbound Agents during scale-down when cleanup is enabled.

Force an immediate ISO refresh without changing the spec:

```bash
kubectl -n demo annotate vsphereagentpool demo-worker \
  agent-forge.containeroo.ch/force-iso-refresh="$(date -Iseconds)" \
  --overwrite
```
