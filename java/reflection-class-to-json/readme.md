# Reflection: Class to JSON

Tiny JSON serializer built with reflection. `JsonReflection.toJson(obj)` walks `getDeclaredFields()`, reads each value, and emits a JSON string — quoting `String`, printing numbers/booleans raw, handling `null`. One method serializes any class (`BankAccount`, `Product`) with no special-casing.

## Run

```bash
mvn compile exec:java -Dexec.mainClass=org.example.Main
```
