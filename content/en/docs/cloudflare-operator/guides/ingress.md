---
title: "Create DNS records from Ingress"
description: "Learn how to create DNS records from Ingress"
weight: 10
---

cloudflare-operator can create DNS records from Ingress resources. This guide shows how to configure the controller to automatically create DNS records for your Ingress resources. The same annotations also apply to supported Gateway API route objects when the feature flag `--enable-gateway-api` is enabled.

## Ingress annotations

One of the following annotations is required: `cloudflare-operator.io/content` or `cloudflare-operator.io/ip-ref`

Ingress objects that do not have one of these annotations will be ignored by cloudflare-operator.

These are the available annotations:

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

An example Ingress resource with annotations:

```yaml
---
apiVersion: networking.k8s.io/v1
kind: Ingress
metadata:
  annotations:
    cloudflare-operator.io/account-ref: account-sample
    cloudflare-operator.io/type: CNAME
    cloudflare-operator.io/content: example.com
  name: blog
  namespace: blog
spec:
  rules:
    - host: blog.example.com
      http:
        paths:
          - backend:
              service:
                name: blog
                port:
                  name: http
            path: /
            pathType: Prefix
```

This will create a DNS record for the host `blog.example.com` with the content `example.com` and the type `CNAME`.

If `cloudflare-operator.io/account-ref` is set, the generated DNSRecord will use that Account. When the matching Zone also has `spec.accountRef.name`, both references must point to the same Account.

## Generated record lifecycle

The controller creates one DNSRecord for each non-empty Ingress host. Generated DNSRecords are created in the Ingress namespace and have an owner reference to the Ingress. Changes to hosts or supported annotations are reflected in those objects.

When an Ingress is being deleted, reconciliation does not create new DNSRecords. Kubernetes garbage collection removes its owner-controlled DNSRecords, whose finalizers then coordinate deletion of the corresponding Cloudflare records. This also prevents attempted creates in a namespace that is already terminating.

{{% alert color="info" %}}
**Note**\
cloudflare-operator only supports `networking.k8s.io/v1` Ingresses.
{{% /alert %}}
