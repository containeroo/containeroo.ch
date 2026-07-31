---
title: "Create DNS records from Gateway API routes"
description: "Learn how to create DNS records from Gateway API route objects"
weight: 11
---

cloudflare-operator can create DNS records from Gateway API route resources. This is an opt-in feature controlled by `--enable-gateway-api`.

Supported route kinds:

- `HTTPRoute`
- `TLSRoute`
- `GRPCRoute`

`TCPRoute` and `UDPRoute` are not supported directly because Gateway API does not define route-level hostnames for them. If you need DNS for TCP or UDP traffic, create a `DNSRecord` resource manually for the hostname that should resolve to your gateway.

## Prerequisites

- Install one or more supported Gateway API route CRDs served from `gateway.networking.k8s.io/v1`.
- Start cloudflare-operator with the flag `--enable-gateway-api`.

At startup, the operator discovers the installed route CRDs and starts only the corresponding controllers. Enabling Gateway API support without any supported route CRD installed causes startup to fail so that a configuration mistake is visible.

When installed with Helm, enable Gateway API reconciliation with:

```yaml
gatewayAPI:
  enabled: true
```

## Route annotations

The same annotations used for Ingress are honored on supported Gateway API route objects. One of these is required:\
`cloudflare-operator.io/content` or `cloudflare-operator.io/ip-ref`

Route objects that do not have one of these annotations will be ignored by cloudflare-operator.

DNS content comes from these annotations; the controller does not derive it from the parent Gateway address or route status.

| Annotation                        | Value                     | Description                                                 | Required                    |
| --------------------------------- | ------------------------- | ----------------------------------------------------------- | --------------------------- |
| `cloudflare-operator.io/content`  | IP address or domain      | DNS record content (e.g. `69.42.0.69`)                      | yes if `ip-ref` is not set  |
| `cloudflare-operator.io/account-ref` | Account resource name   | Account to use for the generated DNSRecord                  | no                          |
| `cloudflare-operator.io/ip-ref`   | Reference to an IP object | e.g. `my-external-ip`                                       | yes if `content` is not set |
| `cloudflare-operator.io/proxied`  | `true` or `false`         | Whether the record should be proxied                        | no                          |
| `cloudflare-operator.io/ttl`      | `1` or `60` - `86400`     | TTL of the DNS record                                       | no                          |
| `cloudflare-operator.io/type`     | `A`, `AAAA` or `CNAME`    | Desired DNS record type                                     | no                          |
| `cloudflare-operator.io/interval` | e.g. `5m0s`               | Interval at which the DNSRecord object should be reconciled | no                          |
| `cloudflare-operator.io/comment`  | e.g. `hello world`        | An optional comment to add to the DNS record                | no                          |

Example HTTPRoute:

```yaml
apiVersion: gateway.networking.k8s.io/v1
kind: HTTPRoute
metadata:
  name: blog
  namespace: cloudflare-operator-system
  annotations:
    cloudflare-operator.io/account-ref: account-sample
    cloudflare-operator.io/content: example.com
    cloudflare-operator.io/type: CNAME
spec:
  parentRefs:
    - name: blog-gateway
  hostnames:
    - blog.example.com
  rules:
    - backendRefs:
        - name: blog
          port: 80
```

This creates a DNS record for the host `blog.example.com` with content `example.com` and type `CNAME`.

Example TLSRoute:

```yaml
apiVersion: gateway.networking.k8s.io/v1
kind: TLSRoute
metadata:
  name: passthrough
  namespace: cloudflare-operator-system
  annotations:
    cloudflare-operator.io/account-ref: account-sample
    cloudflare-operator.io/content: 203.0.113.10
    cloudflare-operator.io/type: A
spec:
  parentRefs:
    - name: tls-gateway
  hostnames:
    - tls.example.com
  rules:
    - backendRefs:
        - name: tls-service
          port: 443
```

This creates a DNS record for the SNI hostname `tls.example.com`.

Example GRPCRoute:

```yaml
apiVersion: gateway.networking.k8s.io/v1
kind: GRPCRoute
metadata:
  name: api
  namespace: cloudflare-operator-system
  annotations:
    cloudflare-operator.io/account-ref: account-sample
    cloudflare-operator.io/content: example.com
    cloudflare-operator.io/type: CNAME
spec:
  parentRefs:
    - name: grpc-gateway
  hostnames:
    - grpc.example.com
  rules:
    - backendRefs:
        - name: grpc-api
          port: 50051
```

This creates a DNS record for the gRPC host `grpc.example.com`.

If `cloudflare-operator.io/account-ref` is set, the generated DNSRecord will use that Account. When the matching Zone also has `spec.accountRef.name`, both references must point to the same Account.

## Generated record lifecycle

The controller creates one DNSRecord for each non-empty route hostname. Generated DNSRecords are created in the route namespace and have an owner reference to the route. Changes to hostnames or supported annotations are reflected in those objects.

When a route is being deleted, reconciliation does not create new DNSRecords. Kubernetes garbage collection removes its owner-controlled DNSRecords, whose finalizers then coordinate deletion of the corresponding Cloudflare records. This also prevents attempted creates in a namespace that is already terminating.
