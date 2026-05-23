---
title: "Core Concepts"
description: "agent-forge-operator core concepts"
weight: 10
---

## Architecture

agent-forge-operator is a demand-driven bridge between HyperShift Agent
NodePools and vSphere inventory. It does not scale NodePools directly and it
does not replace the hosted cluster autoscaler. It reacts to demand that
HyperShift and CAPI already expressed through `AgentMachine` resources.

The reconciliation flow is:

1. The hosted cluster autoscaler changes HyperShift `NodePool` demand.
2. HyperShift and CAPI render `AgentMachine` and `Machine` resources.
3. Waiting `AgentMachine` resources report `Ready=False` with `Reason=NoSuitableAgents`.
4. `VsphereAgentPool` reconciliation plans required capacity from AgentMachine demand, existing Agents, owned VMs, and InfraEnv state.
5. A `VsphereAgent` request creates one vSphere VM.
6. The VM boots the InfraEnv discovery ISO and appears as an Assisted Installer `Agent`.
7. The operator prepares the Agent so the Agent CAPI provider can bind it to a Machine.

## Demand

The operator watches CAPI `AgentMachine` objects for one HyperShift
`NodePool`. It creates capacity only when an `AgentMachine` reports
`Ready=False` with `Reason=NoSuitableAgents`.

The controller counts waiting `AgentMachine` objects, subtracts available
matching Agents and already-provisioning owned VMs, and records the remaining
demand in `VsphereAgentPool.status`.

## vSphere VMs

Each required VM is represented by a `VsphereAgent` object. The
`VsphereAgent` controller creates or recovers the vSphere VM, powers it on with
the active InfraEnv discovery ISO, and records the VM name, BIOS UUID, and
primary MAC address.

When the Assisted Installer `Agent` appears, the pool controller matches it to
the owned VM by BIOS UUID or MAC address before using hostname fallback.

## ISO Cache

The operator caches the InfraEnv discovery ISO in vSphere by content digest.
It downloads and hashes the ISO at `spec.iso.checkInterval`, uploads a new
`<sha256>.iso` object only when the bytes changed or the datastore object is
missing, and inserts the active `status.iso.path` into new VMs.

To force an immediate refresh, annotate the pool with:

```bash
kubectl -n <namespace> annotate vsphereagentpool <name> \
  agent-forge.containeroo.ch/force-iso-refresh="$(date -Iseconds)" \
  --overwrite
```

## Cleanup

Scale-down is conservative. With `spec.cleanupPolicy: Delete`, the operator
waits for a paired CAPI `Machine` to enter deletion and then disappear before
deleting the paired `VsphereAgent`, vSphere VM, and stale unbound Agent.

Set `spec.cleanupPolicy: Retain` when external VM and Agent cleanup should be
handled manually. The operator still creates and prepares capacity, but it does
not plan scale-down VM or Agent deletes.
