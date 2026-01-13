from typing import Annotated, Union
from uuid import uuid4

from fastapi import FastAPI, Form, Header, Request
from fastapi.encoders import jsonable_encoder
from fastapi.responses import HTMLResponse, JSONResponse
from fastapi.staticfiles import StaticFiles
from fastapi.templating import Jinja2Templates

app = FastAPI()
templates = Jinja2Templates(directory="templates")


class Todo:
    def __init__(self, text: str):
        self.id = uuid4()
        self.text = text
        self.done = False


todos = [Todo("Do a POC about HTMX")]


@app.get("/", response_class=HTMLResponse)
async def index(request: Request):
    return templates.TemplateResponse(request=request, name="index.html")


@app.get("/todos", response_class=HTMLResponse)
async def todos_list(
    request: Request, hx_request: Annotated[Union[str, None], Header()] = None
):
    if hx_request:
        return templates.TemplateResponse(
            request=request, name="todos.html", context={"todos": todos}
        )
    return JSONResponse(content=jsonable_encoder(todos))


@app.post("/todos", response_class=HTMLResponse)
async def create_todo(request: Request, todo: Annotated[str, Form()]):
    todos.append(Todo(todo))
    return templates.TemplateResponse(
        request=request, name="todos.html", context={"todos": todos}
    )


@app.put("/todos/{id}", response_class=HTMLResponse)
async def update_todo(request: Request, id: str, text: Annotated[str, Form()]):
    for todo in todos:
        if str(todo.id) == str(id):
            todo.text = text
            break
    return templates.TemplateResponse(
        request=request, name="todos.html", context={"todos": todos}
    )


@app.post("/todos/{todo_id}/toggle", response_class=HTMLResponse)
async def toggle_todo(request: Request, todo_id: str):
    for index, todo in enumerate(todos):
        if str(todo.id) == todo_id:
            todos[index].done = not todos[index].done
            break
    return templates.TemplateResponse(
        request=request, name="todos.html", context={"todos": todos}
    )


@app.post("/todos/{todo_id}/delete", response_class=HTMLResponse)
async def delete_todo(request: Request, todo_id: str):
    for index, todo in enumerate(todos):
        if str(todo.id) == todo_id:
            del todos[index]
            break
    return templates.TemplateResponse(
        request=request, name="todos.html", context={"todos": todos}
    )
