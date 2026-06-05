# BinaryOperator POC

A simple Java proof of concept for `java.util.function.BinaryOperator<T>`.

## What is BinaryOperator?

`BinaryOperator<T>` takes **two operands of the same type** and **returns the same type**. It extends `BiFunction<T,T,T>`.

```java
BinaryOperator<Integer> sum = (a, b) -> a + b;
System.out.println(sum.apply(3, 4)); // 7
```

## Examples in this project

- Sum and multiply integers
- Concatenate strings
- Find max/min using `BinaryOperator.maxBy` / `minBy`
- Combine operations inline

## Run

```bash
mvn compile exec:java -Dexec.mainClass="com.poc.Main"
```
