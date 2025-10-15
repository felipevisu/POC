import typing

import strawberry
from fastapi import FastAPI
from strawberry.fastapi import GraphQLRouter
from strawberry.federation import Schema


@strawberry.federation.type
class Song:
    id: strawberry.ID
    name: str
    band: str


SONGS = [
    Song(id="1", name="The Rain Song", band="Led Zeppeling"),
    Song(id="2", name="Have You Heven Seen The Rain", band="Creedence"),
    Song(id="3", name="Shine On You Crazy Diamond", band="Pink Floyd"),
]


@strawberry.type
class Query:
    @strawberry.field
    def songs(self) -> typing.List[Song]:
        return SONGS

    @strawberry.field
    def song(self, id: strawberry.ID) -> Song:
        return next((s for s in SONGS if s.id == id), None)


schema = Schema(query=Query)
graphql_app = GraphQLRouter(schema)

app = FastAPI()
app.include_router(graphql_app, prefix="/graphql")
