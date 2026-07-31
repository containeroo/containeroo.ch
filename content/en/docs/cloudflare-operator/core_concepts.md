---
title: "Core Concepts"
description: "cloudflare-operator core concepts"
weight: 10
---

## Architecture

cloudflare-operator uses the Kubernetes API as the source of truth for Cloudflare DNS records. Desired state is stored in custom resources and can also be derived from Kubernetes Ingress and Gateway API route objects.

```mermaid
flowchart TB
  hostSources["Kubernetes API · hostname sources<br/>Ingress · HTTPRoute · TLSRoute · GRPCRoute"]
  hostController["DNS host controllers<br/>Ingress always on · Gateway API opt-in + CRD discovery"]
  generated["Kubernetes API · generated DNSRecord<br/>one owner-controlled object per hostname"]
  dnsController["DNSRecord controller<br/>resolve refs · create · update · delete"]
  cloudflare["Cloudflare DNS API"]

  hostSources --> hostController --> generated --> dnsController --> cloudflare

  manual["Kubernetes API<br/>manual / GitOps DNSRecord"] --> dnsController

  scope["Kubernetes API<br/>Secret → Account · Zone"] --> scopeController["Account + Zone controllers<br/>credentials · identity · optional pruning"]
  scopeController --> cloudflare
  scope -. "account + zone refs" .-> dnsController

  ip["Kubernetes API · IP"] --> ipController["IP controller<br/>static or periodically fetched content"]
  ipController <--> ipSources["External IPv4 / IPv6 sources"]
  ip -. "optional content ref" .-> dnsController

  manual ~~~ scope
  scope ~~~ ip

  classDef resource fill:#eef4ff,stroke:#4777b7,color:#172033
  classDef controller fill:#e7f0ff,stroke:#2563eb,color:#172033,stroke-width:2px
  classDef external fill:#fff0df,stroke:#f48120,color:#172033,stroke-width:2px
  class hostSources,generated,manual,scope,ip resource
  class scopeController,ipController,hostController,dnsController controller
  class cloudflare,ipSources external
```

The Account and Zone controllers establish the Cloudflare scope, while the IP controller maintains reusable static or dynamic content. The Ingress controller and the opt-in Gateway API controllers translate hostnames and annotations into owner-controlled DNSRecord objects. The DNSRecord controller then resolves the referenced Account, Zone, and IP resources before applying the record to Cloudflare.

Gateway API support is enabled with `--enable-gateway-api`. At startup, the operator discovers the installed `HTTPRoute`, `TLSRoute`, and `GRPCRoute` CRDs and starts a controller for each supported kind it finds.

## DNS records

Cloudflare DNS records are specified using a CRD (`dnsrecords.cloudflare-operator.io`).\
These records can be created manually, through a GitOps workflow, or automatically generated from Kubernetes Ingress resources and supported Gateway API routes when the feature flag is enabled. Each generated DNSRecord is created in the source object's namespace and is owned by that source.

The Kubernetes API serves as the "single source of truth" for all zones in the configured Cloudflare account.

For more information on creating and using DNS records, please refer to the [DNSRecords documentation](/docs/cloudflare-operator/resources/dnsrecord).

## Accounts and zones

Account resources hold Cloudflare API credentials. If there is exactly one Account in the cluster, Zone and DNSRecord resources can omit `spec.accountRef` and the operator will use that Account automatically.

When you configure multiple Accounts, set `spec.accountRef.name` on each Zone. DNSRecords use the Account from their matching Zone. A DNSRecord can also set `spec.accountRef.name` directly, but it must match the Zone account when the Zone has one.

For Ingress and Gateway API route automation, use the `cloudflare-operator.io/account-ref` annotation when records should be created through a specific Account.

## IP objects

IP objects can be utilized to follow the "don't repeat yourself" (DRY) principle.

DNS records can be configured to use an IP object as the target content.\
If the IP object is updated, all DNS records that use it will be updated automatically.

The effective IP can either be configured in the IP object, or it can be dynamically fetched from the internet.\
This enables you to use cloudflare-operator as a dynamic DNS controller.

## Reconciliation

Reconciliation is the process of ensuring that the state of the cluster aligns with the desired state.

This process also incorporates "self-healing" by retrying failed operations after a specified interval.

Deleting an Ingress or supported Gateway API route stops the controller from creating new DNSRecord objects. Kubernetes owner references remove the generated objects, and their finalizers coordinate deletion of the corresponding Cloudflare records.
