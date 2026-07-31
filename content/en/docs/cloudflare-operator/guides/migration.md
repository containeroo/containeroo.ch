---
title: "Migration to cloudflare-operator"
description: "Learn how to migrate DNS records to cloudflare-operator"
weight: 50
---

cloudflare-operator can be the single source of truth for a zone's DNS records. By default, however, a Zone has `spec.prune: false` and records not represented by DNSRecord objects are left untouched.

If you want to enable `spec.prune: true`, migrate every record that the operator should retain before enabling pruning. Once pruning is enabled, records that are neither represented by DNSRecord objects nor matched by `spec.ignoredRecords` can be deleted from that Zone.

For that we have created a <a href="https://github.com/containeroo/cfop-generator" target="blank">migration tool</a> that generates DNSRecord objects for all DNS records in your DNS zone.

To export your DNS records, follow <a href="https://developers.cloudflare.com/dns/manage-dns-records/how-to/import-and-export/#export-records" target="blank">this guide</a>.

Then, run the migration tool:

```bash
cfop-generator -file <path-to-exported-file>
```

The migration tool will output the generated DNSRecord objects to the console.

Make sure to verify the generated objects before applying them to your cluster.

```bash
kubectl apply -f <path-to-generated-file>
```

Wait until the imported DNSRecord objects report `Ready=True`, then enable pruning on the Zone if that is the desired operating mode. Keep `prune: false` if the zone should continue to contain records managed outside Kubernetes.
