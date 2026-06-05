# Supplier POC

A simple Java proof of concept for `java.util.function.Supplier<T>`.

## What is Supplier?

`Supplier<T>` takes **no input** and **returns a value**. It's useful for lazy initialization, factories, and providing default values.

```java
Supplier<String> greeting = () -> "Hello!";
System.out.println(greeting.get()); // Hello!
```

## Examples in this project

- Get current date/time
- Generate random integers
- Produce unique UUIDs
- Provide default values for nulls
- Act as a list factory

## Run

```bash
mvn compile exec:java -Dexec.mainClass="com.poc.Main"
```
