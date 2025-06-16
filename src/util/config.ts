const kmsSignerClientConfigOpts = {
  clientConfig: {
    interfaces: {
      "google.cloud.kms.v1.KeyManagementService": {
        methods: {
          AsymmetricSign: {
            retry_codes_name: "idempotent",
            retry_params_name: "default",
            timeout_millis: 60000,
          },
        },
        retry_codes: {
          idempotent: ["UNAVAILABLE", "DEADLINE_EXCEEDED"],
        },
        retry_params: {
          default: {
            initial_retry_delay_millis: 1000,
            retry_delay_multiplier: 2.0,
            max_retry_delay_millis: 30000,
            initial_rpc_timeout_millis: 10000,
            rpc_timeout_multiplier: 1.5,
            max_rpc_timeout_millis: 60000,
            total_timeout_millis: 120000,
          },
        },
      },
    },
  },
};

export { kmsSignerClientConfigOpts };
