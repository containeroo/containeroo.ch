---
title: "Installation"
description: "Guide to install cloudflare-operator"
weight: 30
---

This guide walks you through installing cloudflare-operator.

## Prerequisites

- Install Helm 3
- Kubernetes cluster

## Install cloudflare-operator

### Helm repository

Add the cloudflare-operator Helm chart repository:

```bash
helm repo add containeroo https://charts.containeroo.ch
```

Update the Helm chart repository:

```bash
helm repo update
```

### Custom Resource Definitions

As per the Helm best practices, cloudflare-operator Helm chart doesn't ship with CRDs.

To install the latest CRDs, run the following command:

```bash
kubectl apply -f https://github.com/containeroo/cloudflare-operator/releases/latest/download/crds.yaml
```

If you want to install a specific version of CRDs, run the following command:

```bash
export VERSION=x.y.z
kubectl apply -f https://github.com/containeroo/cloudflare-operator/releases/download/v${VERSION}/crds.yaml
```

### Operator installation

#### Default installation

To install the latest version of cloudflare-operator, run the following command:

```bash
helm upgrade --install \
  cloudflare-operator containeroo/cloudflare-operator \
  --namespace cloudflare-operator \
  --create-namespace
```

If you want to install a specific version of cloudflare-operator, run the following command:

```bash
export VERSION=x.y.z
helm upgrade --install \
  cloudflare-operator containeroo/cloudflare-operator \
  --namespace cloudflare-operator \
  --create-namespace \
  --version ${VERSION}
```

#### Customized installation

Create a `values.yaml` file.\
A full list of all supported Helm values can be found <a href="https://artifacthub.io/packages/helm/containeroo/cloudflare-operator" target="blank">here</a>.

Example `values.yaml` file:

```yaml
---
gatewayAPI:
  enabled: true

resources:
  requests:
    cpu: 10m
    memory: 64Mi
```

Leave `image.tag` empty unless you intentionally need to override it; the chart uses its tested `appVersion` by default. Enabling `gatewayAPI` also requires the Gateway API CRDs to be installed in the cluster.

Run the following command to install cloudflare-operator with the customized Helm values:

```bash
helm upgrade --install \
  cloudflare-operator containeroo/cloudflare-operator \
  --namespace cloudflare-operator \
  --create-namespace \
  --values values.yaml
```
