---
title: "agent-forge-operator"
description: "Bridge HyperShift AgentMachine demand to vSphere VM capacity"
---

agent-forge-operator bridges hosted-cluster autoscaling to VM capacity for
HyperShift Agent platform clusters on vSphere.

HyperShift and CAPI remain the source of truth. The operator watches
`AgentMachine` objects rendered for a HyperShift `NodePool`; when they report
`Ready=False` with `Reason=NoSuitableAgents`, it creates vSphere VMs so matching
Assisted Installer `Agent` objects can appear.
