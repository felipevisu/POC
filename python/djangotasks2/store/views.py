import json

from django.http import JsonResponse
from django.shortcuts import render
from django.views.decorators.csrf import ensure_csrf_cookie
from django.views.decorators.http import require_http_methods

from . import tasks


@ensure_csrf_cookie
def store(request):
    return render(request, "store.html")


@require_http_methods(["POST"])
def enqueue_task(request):
    try:
        data = json.loads(request.body)
        task_name = data.get("task_name")
        parameters = data.get("parameters", {})

        task_mapping = {
            "process_payment": tasks.process_payment,
            "update_stock": tasks.update_stock,
            "notify_staff": tasks.notify_staff,
            "notify_customer": tasks.notify_customer,
        }

        if task_name not in task_mapping:
            return JsonResponse(
                {"status": "error", "message": f'Task "{task_name}" not found'},
                status=400,
            )

        task_func = task_mapping[task_name]

        if parameters:
            if len(parameters) == 1:
                param_value = list(parameters.values())[0]
                task_func.enqueue(param_value)
            else:
                task_func.enqueue(**parameters)
        else:
            task_func.enqueue()

        return JsonResponse(
            {
                "status": "success",
                "message": f'Task "{task_name}" enqueued successfully',
            }
        )

    except json.JSONDecodeError:
        return JsonResponse(
            {"status": "error", "message": "Invalid JSON data"}, status=400
        )
    except Exception as e:
        return JsonResponse({"status": "error", "message": str(e)}, status=500)
