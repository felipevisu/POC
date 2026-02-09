package main

import "fmt"

type Point struct {
	x int
	y int
}

func main() {
	size := 3
	points := []Point{
		{0, 1},
		{0, 2},
		{1, 2},
	}

	matrix := make([][]int, size)
	for i := range matrix {
		matrix[i] = make([]int, size)
	}

	for _, point := range points {
		matrix[point.x][point.y] = 1
	}

	fmt.Println("Felipe", matrix)
}