// AUTO-GENERATED — do not edit. Regenerate via: npm run generate:tests
import { runContractTests } from "../../../contract-runner.js";

const entry = {
  "groupId": "sales",
  "artifactId": "order-created",
  "version": "2",
  "jsonSchema": {
    "$id": "order.created.v2",
    "type": "object",
    "required": [
      "orderId",
      "userId",
      "items",
      "totalAmount",
      "currency",
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
      "discount": {
        "type": "number",
        "minimum": 0,
        "maximum": 100
      },
      "currency": {
        "type": "string",
        "enum": [
          "BRL",
          "USD",
          "EUR"
        ]
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
