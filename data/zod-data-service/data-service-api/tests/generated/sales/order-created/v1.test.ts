// AUTO-GENERATED — do not edit. Regenerate via: npm run generate:tests
import { runContractTests } from "../../../contract-runner.js";

const entry = {
  "groupId": "sales",
  "artifactId": "order-created",
  "version": "1",
  "jsonSchema": {
    "$id": "order.created.v1",
    "type": "object",
    "required": [
      "orderId",
      "userId",
      "items",
      "totalAmount",
      "createdAt"
    ],
    "properties": {
      "orderId": {
        "type": "string"
      },
      "userId": {
        "type": "string"
      },
      "items": {
        "type": "array",
        "items": {
          "type": "object",
          "required": [
            "productId",
            "quantity",
            "price"
          ],
          "properties": {
            "productId": {
              "type": "string"
            },
            "quantity": {
              "type": "integer",
              "minimum": 1
            },
            "price": {
              "type": "number"
            }
          }
        }
      },
      "totalAmount": {
        "type": "number"
      },
      "currency": {
        "type": "string",
        "default": "BRL"
      },
      "createdAt": {
        "type": "string",
        "format": "date-time"
      }
    }
  },
  "pipeline": {
    "actions": [
      {
        "type": "kafka",
        "topic": "sales.order-created"
      },
      {
        "type": "database",
        "table": "orders"
      }
    ]
  }
};

runContractTests(entry);
