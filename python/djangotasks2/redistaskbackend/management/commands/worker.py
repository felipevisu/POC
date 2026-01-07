import importlib
import json
import traceback

import redis
from django.core.management.base import BaseCommand
from django.tasks import DEFAULT_TASK_QUEUE_NAME
from django.utils.crypto import get_random_string


class Worker:
    def __init__(self, *, queue_names: list[str], batch, worker_id, redis_config):
        self.queue_names = queue_names
        self.batch = batch
        self.worker_id = worker_id
        self.redis_config = redis_config

        self.interval = 1.0
        self.max_tasks = None

        self.running = True
        self._run_tasks = 0

        self.redis = redis.Redis(
            host=redis_config.get("host", "localhost"),
            port=redis_config.get("port", 6379),
            db=redis_config.get("db", 0),
            decode_responses=True,
        )
        print(
            f"Connected to Redis at {redis_config.get('host', 'localhost')}:{redis_config.get('port', 6379)}"
        )

    def run(self) -> None:
        print("Worker:", self.worker_id)
        print("Queues:", ",".join(self.queue_names))

        while self.running:
            try:
                result = self.redis.brpop(self.queue_names, timeout=5)

                if result:
                    queue_name, task_json = result
                    print(f"\nGot task from {queue_name}: {task_json}")
                    self.process_task(task_json)
                else:
                    print(".", end="", flush=True)

            except KeyboardInterrupt:
                print("\nWorker shutting down...")
                self.running = False
            except Exception as e:
                print(f"\nError in worker loop: {e}")
                traceback.print_exc()

    def process_task(self, task_json):
        """Deserialize and execute a task."""
        try:
            task_data = json.loads(task_json)
            task_path = task_data["task_path"]
            args = task_data["args"]
            kwargs = task_data["kwargs"]

            print(f"Processing: {task_path}({args}, {kwargs})")

            module_path, func_name = task_path.rsplit(".", 1)
            module = importlib.import_module(module_path)
            task_obj = getattr(module, func_name)
            func = task_obj.func
            func(*args, **kwargs)

            print(f"Completed: {task_path}")
            self._run_tasks += 1

        except Exception as e:
            print(f"Failed to process task: {e}")
            traceback.print_exc()


class Command(BaseCommand):
    def add_arguments(self, parser):
        parser.add_argument(
            "--batch",
            type=bool,
            default=False,
            help="Process all and exit",
        )

    def handle(self, *, batch, **options):
        from django.conf import settings

        task_config = settings.TASKS.get("default", {})
        queue_names = list(task_config.get("QUEUES", [DEFAULT_TASK_QUEUE_NAME]))

        redis_config = {
            "host": task_config.get("OPTIONS", {}).get("HOST", "localhost"),
            "port": task_config.get("OPTIONS", {}).get("PORT", 6379),
            "db": task_config.get("OPTIONS", {}).get("DB", 0),
        }

        worker = Worker(
            queue_names=queue_names,
            batch=batch,
            worker_id=get_random_string(32),
            redis_config=redis_config,
        )

        worker.run()
