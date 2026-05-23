---
title: "Cleanup Policy"
description: "Configure VM and Agent cleanup behavior"
weight: 30
---

`spec.cleanupPolicy` controls whether agent-forge-operator deletes external
inventory when demand disappears or when a pool is deleted.

## Delete

`Delete` is the default policy.

```yaml
spec:
  cleanupPolicy: Delete
```

With `Delete`, the operator removes stale owned vSphere VMs and unbound Agents
when they are no longer needed. Scale-down is conservative: the controller
first observes a paired CAPI `Machine` entering deletion, waits until that
Machine has disappeared, and only then deletes the paired `VsphereAgent`, VM,
and stale Agent.

## Retain

Use `Retain` when external cleanup should be handled manually.

```yaml
spec:
  cleanupPolicy: Retain
```

With `Retain`, the operator still creates VMs and patches Agents for new
demand, but it does not plan scale-down VM or Agent deletes. It also does not
destroy vSphere VMs when a pool or `VsphereAgent` is deleted.

This is useful for conservative production rollouts where operators want to
observe status and reconcile scale-up before allowing automatic cleanup.
