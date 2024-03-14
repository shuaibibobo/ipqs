# IPQS

Generates telemetry data required for [IPQualityScore](https://www.ipqualityscore.com/).

### Install

```sh
git clone https://github.com/AzureFlow/ipqs.git
pnpm install --omit=dev
```

### Usage

```js
import {sendTelemetry} from "@azureflow/ipqualityscore";
import {HttpsProxyAgent} from "https-proxy-agent";


const proxyAgent = new HttpsProxyAgent(`http://user:pass@host:port`);

/** @type {Map<string, string>} */
const store = new Map().set("website_section", "example");

const result = await sendTelemetry({
    // https://www.ipqualityscore.com/create-account
	ipqsPublicKey: "CE6pu4Htn20GN1hPLRYvoGBpfCcRIoUjbleo2JGPntwo306Mkl67eaAyx4trD13r4gAeX3wXILaoYxthNFRDMxgSHKopPqAIeWrPsLdf1xHOu1C71wcHHLPLMOhLFsjmrR9Mmj6wcGIUopqIY4BtYF3xFPOLDFylShb5SXqc2j1RNg5Le7Jn65jVWL53REunKqo1iv5gIZ0yOjJitQdpSuUHXLa14hEWX6467qEtLpkHJssc3JnyLHI7tVZdpg1Z",
	store: store,
	ipqsTracker: "*",
	ipqsDomain: "fn.us.ipqscdn.com",
	proxyAgent: proxyAgent,
	userAgent: "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
});
console.log("telemetry result:", result);
```

### Credits

- [TLS-Client](https://github.com/bogdanfinn/tls-client) by [bogdanfinn](https://github.com/bogdanfinn)
- See [`package.json`](package.json) for more.

### Disclaimer

This project is in no way associated with IPQualityScore LLC.

This project is also provided without any warranties. Please see [LICENSE](LICENSE) for more information.
