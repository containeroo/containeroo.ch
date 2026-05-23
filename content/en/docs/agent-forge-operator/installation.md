---
title: "Installation"
description: "Guide to install agent-forge-operator"
weight: 30
---

This guide walks you through installing agent-forge-operator.

## Prerequisites

- Install Helm 3.
- Kubernetes or OpenShift cluster.
- HyperShift and Assisted Installer resources for Agent platform clusters.

## Install agent-forge-operator

### Helm repository

Add the containeroo Helm chart repository:

```bash
helm repo add containeroo https://charts.containeroo.ch
```

Update the Helm chart repository:

```bash
helm repo update
```

### Custom Resource Definitions

The Helm chart includes the `VsphereAgent` and `VsphereAgentPool` CRDs in the
chart `crds/` directory. Helm installs CRDs on first install, but does not
upgrade or delete CRDs during normal chart upgrades.

To install or upgrade the latest CRDs explicitly, run:

```bash
kubectl apply -f https://github.com/containeroo/agent-forge-operator/releases/latest/download/crds.yaml
```

If you want to install a specific version of CRDs, run:

```bash
export VERSION=x.y.z
kubectl apply -f https://github.com/containeroo/agent-forge-operator/releases/download/v${VERSION}/crds.yaml
```

### Operator installation

#### Default installation

To install the latest version of agent-forge-operator, run:

```bash
helm upgrade --install \
  agent-forge-operator containeroo/agent-forge-operator \
  --namespace agent-forge-operator-system \
  --create-namespace
```

If you want to install a specific version, run:

```bash
export VERSION=x.y.z
helm upgrade --install \
  agent-forge-operator containeroo/agent-forge-operator \
  --namespace agent-forge-operator-system \
  --create-namespace \
  --version ${VERSION}
```

#### Customized installation

Create a `values.yaml` file. A full list of supported Helm values can be found
<a href="https://artifacthub.io/packages/helm/containeroo/agent-forge-operator" target="blank">on Artifact Hub</a>.

Example `values.yaml` file:

```yaml
---
image:
  repository: ghcr.io/containeroo/agent-forge-operator
  tag: latest
  pullPolicy: IfNotPresent
metrics:
  serviceMonitor:
    enabled: true
```

Install or upgrade agent-forge-operator with the customized Helm values:

```bash
helm upgrade --install \
  agent-forge-operator containeroo/agent-forge-operator \
  --namespace agent-forge-operator-system \
  --create-namespace \
  --values values.yaml
```

### Release manifests

You can also install the release manifests directly:

```bash
export VERSION=0.0.16
kubectl apply -f https://github.com/containeroo/agent-forge-operator/releases/download/v${VERSION}/crds.yaml
kubectl apply -k github.com/containeroo/agent-forge-operator//config/default?ref=v${VERSION}
```
