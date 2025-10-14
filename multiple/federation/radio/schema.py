import typing

import strawberry
from fastapi import FastAPI
from strawberry.fastapi import GraphQLRouter


@strawberry.type
class Song:
    name: str
    band: str


def get_songs():
    return [
        Song(name="The Rain Song", band="Led Zeppeling"),
        Song(name="Have You Heven Seen The Rain", band="Creedence"),
        Song(name="Shine On You Crazy Diamond", band="Pink Floyd"),
    ]


@strawberry.type
class Query:
    songs: typing.List[Song] = strawberry.field(resolver=get_songs)


schema = strawberry.Schema(query=Query)
graphql_app = GraphQLRouter(schema)

app = FastAPI()
app.include_router(graphql_app, prefix="/graphql")
