# Redux Clone

## Concept

In this redux clone the Proxy is used to create a copy of the state, but it's possible to set handler to this proxy overwritting the object methods like get or set. By overwritting the set it will not be possible anymore to change the state directly, only through the dispatch function. This pattern implements the redux core principle: immutability.

## Demo

<img src="./demo.gif" alt="demo" />
