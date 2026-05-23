---
title: "VsphereAgent"
description: "Learn how to use the VsphereAgent resource"
weight: 20
---

The API specification can be viewed [here](/docs/agent-forge-operator/api_reference/#agent-forge.containeroo.ch/v1alpha1.VsphereAgent).

`VsphereAgent` represents one vSphere VM requested to satisfy AgentMachine
demand.

Most users do not create `VsphereAgent` resources manually. The
`AgentMachine` controller creates one `VsphereAgent` for each waiting
`AgentMachine` when the selected `VsphereAgentPool` needs additional capacity.

## Example

```yaml
apiVersion: agent-forge.containeroo.ch/v1alpha1
kind: VsphereAgent
metadata:
  name: demo-worker-abc12
  namespace: demo
spec:
  poolRef:
    name: demo-worker
```

## Spec

| Field               | Description |
| ------------------- | ----------- |
| `spec.poolRef.name` | Name of the `VsphereAgentPool` whose configuration is used to create and manage the VM. |

## Status

| Field                         | Description |
| ----------------------------- | ----------- |
| `status.observedGeneration`   | Latest resource generation reconciled by the controller. |
| `status.vm.name`              | vSphere VM name. |
| `status.vm.biosUUID`          | VM BIOS UUID when known. |
| `status.vm.macAddress`        | Primary NIC MAC address when known. |
| `status.vm.agentRef`          | Discovered Assisted Installer Agent matched to this VM. |
| `status.vm.machineRef`        | CAPI Machine paired with this VM when bound. |
| `status.vm.phase`             | VM lifecycle phase such as `Provisioning`, `Available`, `Bound`, `Released`, or `Orphaned`. |
| `status.conditions`           | Readiness and provider errors. |

When a `VsphereAgent` is deleted, its finalizer deletes the paired vSphere VM
unless the owning `VsphereAgentPool` uses `spec.cleanupPolicy: Retain`.
