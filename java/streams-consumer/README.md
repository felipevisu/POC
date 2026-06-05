# Consumer POC

A simple Java proof of concept for `java.util.function.Consumer<T>`.

## What is Consumer?

`Consumer<T>` takes **one input** and **returns nothing**. It's useful for printing, logging, and mutating objects.

```java
Consumer<String> printer = s -> System.out.println(s);
printer.accept("Hello!"); // Hello!
```

## Examples in this project

- Print messages
- Print the square of a number
- Chain consumers with `andThen`
- Use with `forEach` on a list
- Collect items into a mutable list

## Run

```bash
mvn compile exec:java -Dexec.mainClass="com.poc.Main"
```
