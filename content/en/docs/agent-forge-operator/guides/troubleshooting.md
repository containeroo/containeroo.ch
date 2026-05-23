---
title: "Troubleshooting"
description: "Troubleshoot agent-forge-operator reconciliation"
weight: 20
---

## AgentMachine demand is not observed

Check AgentMachines in the hosted control plane namespace:

```bash
kubectl -n demo-demo get agentmachines.capi-provider.agent-install.openshift.io -o yaml
kubectl -n demo get vsphereagentpool demo-worker \
  -o jsonpath='{.status.conditions[?(@.type=="AgentMachineDemandFound")]}{"\n"}'
```

Confirm that the AgentMachine has the expected
`hypershift.openshift.io/nodePool` annotation and reports `Ready=False` with
`Reason=NoSuitableAgents`.

## InfraEnv ISO is unavailable

```bash
kubectl -n demo get infraenv demo -o yaml
kubectl -n demo get vsphereagentpool demo-worker \
  -o jsonpath='{.status.conditions[?(@.type=="InfraEnvAvailable")]}{"\n"}'
```

The operator cannot create bootable discovery VMs until
`status.isoDownloadURL` is populated on the InfraEnv.

## No Agents match

```bash
kubectl -n demo get agents -o yaml
kubectl -n demo get vsphereagentpool demo-worker -o jsonpath='{.status.matchingAgents}{"\n"}'
```

Compare Agent labels with `spec.agent.labels` on the `VsphereAgentPool`.
Labels should also match the NodePool Agent selector.

## VM identity does not match the Agent

```bash
kubectl -n demo get vsphereagentpool demo-worker \
  -o jsonpath='{range .status.ownedVMs[*]}{.name}{"\t"}{.biosUUID}{"\t"}{.macAddress}{"\t"}{.agentRef.name}{"\n"}{end}'

kubectl -n demo get agents.agent-install.openshift.io \
  -o custom-columns=NAME:.metadata.name,HOST:.spec.hostname,BIOS:.status.inventory.systemVendor.serialNumber,MAC:.status.inventory.interfaces[0].macAddress
```

The VM name in `status.ownedVMs[*].name` should match the Agent
`spec.hostname`. The BIOS UUID and MAC address should describe the same
vSphere VM.

## vSphere errors

```bash
kubectl -n demo describe vsphereagentpool demo-worker
kubectl -n agent-forge-operator-system logs deploy/agent-forge-operator-controller-manager -c manager
```

Confirm the vSphere Secret keys, datacenter, datastore cluster, ISO datastore,
resource pool, folder, and network values.
