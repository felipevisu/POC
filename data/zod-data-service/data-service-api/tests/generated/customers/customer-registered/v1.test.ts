// AUTO-GENERATED — do not edit. Regenerate via: npm run generate:tests
import { runContractTests } from "../../../contract-runner.js";

const entry = {
  "groupId": "customers",
  "artifactId": "customer-registered",
  "version": "1",
  "jsonSchema": {
    "$id": "customer.registered.v1",
    "type": "object",
    "required": [
      "customerId",
      "email",
      "fullName",
      "registeredAt"
    ],
    "properties": {
      "customerId": {
        "type": "string"
      },
      "email": {
        "type": "string",
        "format": "email"
      },
      "fullName": {
        "type": "string",
        "minLength": 1,
        "maxLength": 200
      },
      "phone": {
        "type": "string"
      },
      "address": {
        "type": "object",
        "required": [
          "street",
          "city",
          "state",
          "zipCode"
        ],
        "properties": {
          "street": {
            "type": "string"
          },
          "city": {
            "type": "string"
          },
          "state": {
            "type": "string"
          },
          "zipCode": {
            "type": "string"
          }
        }
      },
      "registeredAt": {
        "type": "string",
        "format": "date-time"
      }
    }
  },
  "pipeline": {
    "actions": [
      {
        "type": "kafka",
        "topic": "customers.registered"
      },
      {
        "type": "database",
        "table": "customers"
      }
    ]
  }
};

runContractTests(entry);
