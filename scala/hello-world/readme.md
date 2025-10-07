# Scala Hello World

## Learnings

**Install Scala**

```bash
curl -fL https://github.com/coursier/coursier/releases/latest/download/cs-x86_64-pc-linux.gz | gzip -d > cs && chmod +x cs && ./cs setup
```

**Add path on terminal**

```bash
nano ~/.bashrc

// Copy this to the file
export PATH="$PATH:/home/felipe/.local/share/coursier/bin"
```

**Run the code**

```bash
scala run hello.scala
```
