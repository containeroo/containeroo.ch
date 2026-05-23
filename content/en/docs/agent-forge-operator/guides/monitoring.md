---
title: "Monitoring with Prometheus"
linkTitle: "Monitoring with Prometheus"
description: "Monitor agent-forge-operator with Prometheus"
weight: 10
---

## Prerequisites

- Prometheus Operator or kube-prometheus-stack.
- agent-forge-operator installed through the Helm chart.

## Enable metrics resources

Create a `values.yaml` file:

```yaml
---
metrics:
  serviceMonitor:
    enabled: true
  prometheusRule:
    enabled: true
```

Install or upgrade the Helm chart by following [the installation guide](/docs/agent-forge-operator/installation/#customized-installation).

## Available metrics

The controller exposes these application metrics:

| Metric                                    | Meaning |
| ----------------------------------------- | ------- |
| `agent_forge_vsphere_vm_operations_total` | VM create/delete attempts by operation and result. |
| `agent_forge_iso_operations_total`        | ISO cache ensure/delete attempts by operation and result. |
| `agent_forge_pool_capacity`               | Per-pool capacity gauges for desired, waiting, available, pending, and planned-create counts. |

You can also use kube-state-metrics to alert on `VsphereAgentPool` and
`VsphereAgent` conditions once those custom resources are configured for state
metrics collection.
