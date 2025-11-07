package main

import (
	"net/http"

	"github.com/gin-gonic/gin"
)


type album struct {
	ID string `json:"id"`
	Title string `json:"title"`
	Artist string `json:"artist"`
	Price float64 `json:"price"`
}

func getAlbums(c *gin.Context){
	var albums = []album{
		{ID: "1", Title: "Going to California", Artist: "Led Zeppelin", Price: 200},
		{ID: "2", Title: "The lunatic is on the grass", Artist: "Pink Floyd", Price: 100},
	}
	c.IndentedJSON(http.StatusOK, albums)
}

func main(){
	router := gin.Default()
	router.GET("/albums", getAlbums)
	router.Run("localhost:8080")
}