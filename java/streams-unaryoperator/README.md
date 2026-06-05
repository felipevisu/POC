# UnaryOperator POC

A simple Java proof of concept for `java.util.function.UnaryOperator<T>`.

## What is UnaryOperator?

`UnaryOperator<T>` takes **one operand** and **returns the same type**. It extends `Function<T,T>` and is useful for transformations.

```java
UnaryOperator<String> upper = String::toUpperCase;
System.out.println(upper.apply("hello")); // HELLO
```

## Examples in this project

- Increment and negate integers
- Uppercase and normalize strings
- Chain operators with `andThen`
- Apply to a list with `replaceAll`
- Use `UnaryOperator.identity()`

## Run

```bash
mvn compile exec:java -Dexec.mainClass="com.poc.Main"
```
