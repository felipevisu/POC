# Django 6 - Task backend with Redis

Django 6 released a new feature `@tasks`.

```python
@task(priority=2, queue_name="emails")
def email_users(emails, subject, message):
    return send_mail(
        subject=subject, message=message, from_email=None, recipient_list=emails
    )
```

When work needs to be done in the background, Django creates a Task, which is stored in the Queue Store. This Task contains all the metadata needed to execute it, as well as a unique identifier for Django to retrieve the result later.

A Worker will look at the Queue Store for new Tasks to run. When a new Task is added, a Worker claims the Task, executes it, and saves the status and result back to the Queue Store. These workers run outside the request-response lifecycle.

## Configuring a Task backend

The Task backend determines how and where Tasks are stored for execution and how they are executed. Different Task backends have different characteristics and configuration options, which may impact the performance and reliability of your application. Django comes with built-in backends, but these are for development and testing only.

A Task backend is a class that inherits `BaseTaskBackend`. At a minimum, it must implement `BaseTaskBackend.enqueue()`. If you’re building your own backend, you can use the built-in Task backends as reference implementations. You’ll find the code in the `django/tasks/backends/` directory of the Django source.

## How did I implemented my own task backend

### Step 1 - Connect with redis

The `RedisTaskBackend` inherits from `BaseTaskBackend` and connects to Redis in `__init__`:

```python
# redistaskbackend/backend.py
self.redis = redis.Redis(host=host, port=port, db=db, decode_responses=True)
```

Configuration in `settings.py`:

```python
TASKS = {
    "default": {
        "BACKEND": "redistaskbackend.backend.RedisTaskBackend",
        "QUEUES": ["default", "emails"],
        "OPTIONS": {
            "HOST": "localhost",
            "PORT": 6379,
            "DB": 0,
        }
    }
}
```

### Step 2 - Enqueue the task

When you decorate a function with `@task`, calling `enqueue()` passes a `Task` object to the backend. The `Task` object has a `func` property containing the original function. The backend extracts the module path and function name from this property:

```python
def enqueue(self, task: Task, args, kwargs):
    # The task object contains the decorated function
    task_func = task.func  # Original function from @task decorator

    # Extract module path and function name
    module_path = task_func.__module__  # e.g., "store.tasks"
    func_name = task_func.__name__      # e.g., "process_payment"
    full_path = f"{module_path}.{func_name}"  # "store.tasks.process_payment"

    # Serialize task data with the function path (not the function object)
    task_data = {
        "task_path": full_path,  # Save as string
        "args": list(args),
        "kwargs": kwargs,
    }

    # Push to Redis queue
    self.redis.lpush(task.queue_name, json.dumps(task_data))
```

This stores the function path as a string so it can be imported and executed later by the worker.

### Step 3 - Create a worker

The worker listens to Redis and executes tasks (`management/commands/worker.py`):

```python
# Listen for tasks (blocking pop)
result = self.redis.brpop(self.queue_names, timeout=5)

if result:
    queue_name, task_json = result
    task_data = json.loads(task_json)

    # Load the function from source code
    module_path, func_name = task_data["task_path"].rsplit(".", 1)
    module = importlib.import_module(module_path)  # Import the module
    task_obj = getattr(module, func_name)          # Get the task decorator
    func = task_obj.func                           # Get the actual function

    # Execute it
    func(*task_data["args"], **task_data["kwargs"])
```

Run the worker:

```bash
python manage.py worker
```

## Running with Docker

The project includes Docker Compose configuration with 3 services:

**Services:**

- `redis` - Redis server for task queue
- `django` - Django web application
- `worker` - Background task worker

**Start all services:**

```bash
docker-compose up
```

**Start in detached mode:**

```bash
docker-compose up -d
```

**View logs:**

```bash
docker-compose logs -f
docker-compose logs -f worker  # Worker logs only
```

**Stop services:**

```bash
docker-compose down
```

The Django app will be available at `http://localhost:8000`, and the worker will automatically start processing tasks from Redis.
