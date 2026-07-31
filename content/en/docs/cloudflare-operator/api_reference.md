---
title: "API Reference"
description: "cloudflare-operator API Reference"
weight: 50
---

## Packages
- [cloudflare-operator.io/v1](#cloudflare-operatoriov1)


## cloudflare-operator.io/v1

Package v1 contains API schema definitions for the cloudflare-operator.io v1 API group.

### Resource Types
- [Account](#account)
- [DNSRecord](#dnsrecord)
- [IP](#ip)
- [Zone](#zone)





<a id="cloudflare-operator.io/v1.Account"></a>
#### Account



Account is the Schema for the accounts API





| Field | Description | Default | Validation |
| --- | --- | --- | --- |
| `apiVersion` _string_ | `cloudflare-operator.io/v1` | | |
| `kind` _string_ | `Account` | | |
| `metadata` _[ObjectMeta](https://kubernetes.io/docs/reference/generated/kubernetes-api/v1.36/#objectmeta-v1-meta)_ | Refer to Kubernetes API documentation for fields of `metadata`. |  |  |
| `spec` _[AccountSpec](#accountspec)_ |  |  |  |
| `status` _[AccountStatus](#accountstatus)_ |  |  |  |




<a id="cloudflare-operator.io/v1.AccountRef"></a>
#### AccountRef







_Appears in:_
- [DNSRecordSpec](#dnsrecordspec)
- [ZoneSpec](#zonespec)

| Field | Description | Default | Validation |
| --- | --- | --- | --- |
| `name` _string_ | Name of the Account object. |  |  |




<a id="cloudflare-operator.io/v1.AccountSpec"></a>
#### AccountSpec



AccountSpec defines the desired state of Account



_Appears in:_
- [Account](#account)

| Field | Description | Default | Validation |
| --- | --- | --- | --- |
| `apiToken` _[AccountSpecApiToken](#accountspecapitoken)_ | Cloudflare API token |  |  |
| `interval` _[Duration](https://kubernetes.io/docs/reference/generated/kubernetes-api/v1.36/#duration-v1-meta)_ | Interval to check account status | 5m |  |
| `managedZones` _string array_ | List of zone names that should be managed by cloudflare-operator<br />Deprecated and will be removed in a future release |  |  |




<a id="cloudflare-operator.io/v1.AccountSpecApiToken"></a>
#### AccountSpecApiToken







_Appears in:_
- [AccountSpec](#accountspec)

| Field | Description | Default | Validation |
| --- | --- | --- | --- |
| `secretRef` _[SecretReference](https://kubernetes.io/docs/reference/generated/kubernetes-api/v1.36/#secretreference-v1-core)_ | Secret containing the API token (key must be named "apiToken") |  |  |




<a id="cloudflare-operator.io/v1.AccountStatus"></a>
#### AccountStatus



AccountStatus defines the observed state of Account



_Appears in:_
- [Account](#account)

| Field | Description | Default | Validation |
| --- | --- | --- | --- |
| `conditions` _[Condition](https://kubernetes.io/docs/reference/generated/kubernetes-api/v1.36/#condition-v1-meta) array_ | Conditions contains the different condition statuses for the Account object. |  |  |




<a id="cloudflare-operator.io/v1.DNSRecord"></a>
#### DNSRecord



DNSRecord is the Schema for the dnsrecords API





| Field | Description | Default | Validation |
| --- | --- | --- | --- |
| `apiVersion` _string_ | `cloudflare-operator.io/v1` | | |
| `kind` _string_ | `DNSRecord` | | |
| `metadata` _[ObjectMeta](https://kubernetes.io/docs/reference/generated/kubernetes-api/v1.36/#objectmeta-v1-meta)_ | Refer to Kubernetes API documentation for fields of `metadata`. |  |  |
| `spec` _[DNSRecordSpec](#dnsrecordspec)_ |  |  |  |
| `status` _[DNSRecordStatus](#dnsrecordstatus)_ |  |  |  |




<a id="cloudflare-operator.io/v1.DNSRecordSpec"></a>
#### DNSRecordSpec



DNSRecordSpec defines the desired state of DNSRecord



_Appears in:_
- [DNSRecord](#dnsrecord)

| Field | Description | Default | Validation |
| --- | --- | --- | --- |
| `name` _string_ | DNS record name (e.g. example.com) |  | MaxLength: 255 <br /> |
| `accountRef` _[AccountRef](#accountref)_ | Reference to the Account used for this DNS record. When omitted, the<br />operator falls back to the owning Zone account, then to the only Account<br />in the cluster. |  |  |
| `content` _string_ | DNS record content (e.g. 127.0.0.1) |  |  |
| `ipRef` _[DNSRecordSpecIPRef](#dnsrecordspecipref)_ | Reference to an IP object |  |  |
| `type` _string_ | DNS record type | A |  |
| `proxied` _boolean_ | Whether the record is receiving the performance and security benefits of Cloudflare | true |  |
| `ttl` _integer_ | Time to live, in seconds, of the DNS record. Must be between 60 and 86400, or 1 for "automatic" (e.g. 3600) | 1 | Maximum: 86400 <br />Minimum: 1 <br /> |
| `data` _[JSON](https://kubernetes.io/docs/reference/generated/kubernetes-api/v1.36/#json-v1-apiextensions-k8s-io)_ | Data holds arbitrary key-value pairs used to further configure the DNS record |  |  |
| `priority` _integer_ | Required for MX, SRV and URI records; unused by other record types. Records with lower priorities are preferred. |  | Maximum: 65535 <br />Minimum: 0 <br /> |
| `comment` _string_ | Comments or notes about the DNS record. This field has no effect on DNS responses. |  | MaxLength: 100 <br /> |
| `interval` _[Duration](https://kubernetes.io/docs/reference/generated/kubernetes-api/v1.36/#duration-v1-meta)_ | Interval to check DNSRecord | 5m |  |




<a id="cloudflare-operator.io/v1.DNSRecordSpecIPRef"></a>
#### DNSRecordSpecIPRef







_Appears in:_
- [DNSRecordSpec](#dnsrecordspec)

| Field | Description | Default | Validation |
| --- | --- | --- | --- |
| `name` _string_ | Name of the IP object |  |  |




<a id="cloudflare-operator.io/v1.DNSRecordStatus"></a>
#### DNSRecordStatus



DNSRecordStatus defines the observed state of DNSRecord



_Appears in:_
- [DNSRecord](#dnsrecord)

| Field | Description | Default | Validation |
| --- | --- | --- | --- |
| `conditions` _[Condition](https://kubernetes.io/docs/reference/generated/kubernetes-api/v1.36/#condition-v1-meta) array_ | Conditions contains the different condition statuses for the DNSRecord object. |  |  |
| `recordID` _string_ | Cloudflare DNS record ID |  |  |




<a id="cloudflare-operator.io/v1.IP"></a>
#### IP



IP is the Schema for the ips API





| Field | Description | Default | Validation |
| --- | --- | --- | --- |
| `apiVersion` _string_ | `cloudflare-operator.io/v1` | | |
| `kind` _string_ | `IP` | | |
| `metadata` _[ObjectMeta](https://kubernetes.io/docs/reference/generated/kubernetes-api/v1.36/#objectmeta-v1-meta)_ | Refer to Kubernetes API documentation for fields of `metadata`. |  |  |
| `spec` _[IPSpec](#ipspec)_ |  |  |  |
| `status` _[IPStatus](#ipstatus)_ |  |  |  |




<a id="cloudflare-operator.io/v1.IPSpec"></a>
#### IPSpec



IPSpec defines the desired state of IP



_Appears in:_
- [IP](#ip)

| Field | Description | Default | Validation |
| --- | --- | --- | --- |
| `address` _string_ | IP address (omit if type is dynamic) |  |  |
| `type` _string_ | IP address type (static or dynamic) | static | Enum: [static dynamic] <br /> |
| `interval` _[Duration](https://kubernetes.io/docs/reference/generated/kubernetes-api/v1.36/#duration-v1-meta)_ | Interval at which a dynamic IP should be checked |  |  |
| `ipSources` _[IPSpecIPSources](#ipspecipsources) array_ | IPSources can be configured to get an IP from an external source (e.g. an API or public IP echo service) |  |  |




<a id="cloudflare-operator.io/v1.IPSpecIPSources"></a>
#### IPSpecIPSources







_Appears in:_
- [IPSpec](#ipspec)

| Field | Description | Default | Validation |
| --- | --- | --- | --- |
| `url` _string_ | URL of the IP source (e.g. https://checkip.amazonaws.com) |  |  |
| `requestBody` _string_ | RequestBody to be sent to the URL |  |  |
| `requestHeaders` _[JSON](https://kubernetes.io/docs/reference/generated/kubernetes-api/v1.36/#json-v1-apiextensions-k8s-io)_ | RequestHeaders to be sent to the URL |  |  |
| `requestHeadersSecretRef` _[SecretReference](https://kubernetes.io/docs/reference/generated/kubernetes-api/v1.36/#secretreference-v1-core)_ | RequestHeadersSecretRef is a secret reference to the headers to be sent to the URL (e.g. for authentication)<br />where the key is the header name and the value is the header value |  |  |
| `requestMethod` _string_ | RequestMethod defines the HTTP method to be used |  | Enum: [GET POST PUT DELETE] <br /> |
| `responseJQFilter` _string_ | ResponseJQFilter applies a JQ filter to the response to extract the IP |  |  |
| `postProcessingRegex` _string_ | PostProcessingRegex defines the regular expression to be used to extract the IP from the response or a JQ filter result |  |  |
| `insecureSkipVerify` _boolean_ | InsecureSkipVerify defines whether to skip TLS certificate verification |  |  |




<a id="cloudflare-operator.io/v1.IPStatus"></a>
#### IPStatus



IPStatus defines the observed state of IP



_Appears in:_
- [IP](#ip)

| Field | Description | Default | Validation |
| --- | --- | --- | --- |
| `address` _string_ | Address contains the resolved IP address currently used by the operator.<br />For static IPs this mirrors spec.address after validation, for dynamic IPs<br />it is the last successfully discovered address. |  |  |
| `conditions` _[Condition](https://kubernetes.io/docs/reference/generated/kubernetes-api/v1.36/#condition-v1-meta) array_ | Conditions contains the different condition statuses for the IP object. |  |  |




<a id="cloudflare-operator.io/v1.Zone"></a>
#### Zone



Zone is the Schema for the zones API





| Field | Description | Default | Validation |
| --- | --- | --- | --- |
| `apiVersion` _string_ | `cloudflare-operator.io/v1` | | |
| `kind` _string_ | `Zone` | | |
| `metadata` _[ObjectMeta](https://kubernetes.io/docs/reference/generated/kubernetes-api/v1.36/#objectmeta-v1-meta)_ | Refer to Kubernetes API documentation for fields of `metadata`. |  |  |
| `spec` _[ZoneSpec](#zonespec)_ |  |  |  |
| `status` _[ZoneStatus](#zonestatus)_ |  |  |  |




<a id="cloudflare-operator.io/v1.ZoneSpec"></a>
#### ZoneSpec



ZoneSpec defines the desired state of Zone



_Appears in:_
- [Zone](#zone)

| Field | Description | Default | Validation |
| --- | --- | --- | --- |
| `name` _string_ | Name of the zone |  |  |
| `accountRef` _[AccountRef](#accountref)_ | Reference to the Account used for this zone. When omitted, the operator<br />falls back to the only Account in the cluster. |  |  |
| `prune` _boolean_ | Prune determines whether DNS records in the zone that are not managed by cloudflare-operator should be automatically removed | false |  |
| `interval` _[Duration](https://kubernetes.io/docs/reference/generated/kubernetes-api/v1.36/#duration-v1-meta)_ | Interval to check zone status | 5m |  |
| `ignoredRecords` _object (keys:string, values:string array)_ | IgnoredRecords are DNS records that should be ignored by the operator when prune is enabled<br />It has no effect when prune is disabled<br />Each key represents a record type, and the value is a list of record names<br />Lines starting with a '^' are treated as regex, otherwise they are treated as prefixes | \{ TXT:[_acme-challenge cf2024-1._domainkey] \} |  |




<a id="cloudflare-operator.io/v1.ZoneStatus"></a>
#### ZoneStatus



ZoneStatus defines the observed state of Zone



_Appears in:_
- [Zone](#zone)

| Field | Description | Default | Validation |
| --- | --- | --- | --- |
| `id` _string_ | ID of the zone |  |  |
| `conditions` _[Condition](https://kubernetes.io/docs/reference/generated/kubernetes-api/v1.36/#condition-v1-meta) array_ | Conditions contains the different condition statuses for the Zone object. |  |  |




_This page is generated from the operator API types with [crd-ref-docs](https://github.com/elastic/crd-ref-docs)._