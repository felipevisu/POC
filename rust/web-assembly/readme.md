# Web Assembly

## Setup

### Install

```bash
curl https://sh.rustup.rs -sSf | sh

rustup target add wasm32-unknown-unknown

cargo install wasm-pack
```

### Initialize

```bash
wasm-pack new wasm-hash
cd wasm-hash
```

### Build

```bash
wasm-pack build --target web
```

## Results

<img src="/screenshot.png" alt="screenshot" />
