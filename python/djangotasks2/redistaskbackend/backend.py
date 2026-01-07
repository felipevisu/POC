import json

import redis
from django.tasks import Task
from django.tasks.backends.base import BaseTaskBackend


class RedisTaskBackend(BaseTaskBackend):
    def __init__(self, alias, params):
        super().__init__(alias, params)
        host = self.options.get("HOST", "localhost")
        port = self.options.get("PORT", 6379)
        db = self.options.get("DB", 0)
        try:
            self.redis = redis.Redis(host=host, port=port, db=db, decode_responses=True)
            print("Connected to Redis")
        except redis.exceptions.ConnectionError as e:
            print(f"Failed to connect to Redis: {e}")
            raise

    def enqueue(self, task: Task, args, kwargs):
        if task.queue_name not in self.queues:
            return

        task_func = task.func
        module_path = task_func.__module__
        func_name = task_func.__name__
        full_path = f"{module_path}.{func_name}"
        task_data = {
            "task_path": full_path,
            "args": list(args),
            "kwargs": kwargs,
        }
        task_json = json.dumps(task_data)
        self.redis.lpush(task.queue_name, task_json)

        print(f"Enqueued task: {full_path} with args={args}, kwargs={kwargs}")

    def get_result(self, result_id):
        raise NotImplementedError(
            "This backend does not support retrieving or refreshing results."
        )
