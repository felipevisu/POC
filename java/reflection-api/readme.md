# Reflection API

Basic `java.lang.reflect` over a `BankAccount`:

- **Read** — list declared fields with name and type.
- **Invoke** — call private method `applyInterest(double)` and `getBalance()` via `Method.invoke`.
- **Modify** — overwrite private fields `balance` and `owner` via `Field.setAccessible(true)`.

## Run

```bash
mvn compile exec:java -Dexec.mainClass=org.example.Main
```
