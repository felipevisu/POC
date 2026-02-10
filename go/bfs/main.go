package main

import "fmt"

func bfs(matrix [][]int, src int) []int {
	size := len(matrix)
	visited := make([]bool, size)
	response := make([]int, 0, size)
	queue := make([]int, 0, size)

	visited[src] = true
	queue = append(queue, src)

	for len(queue) > 0 {
		current := queue[0]
		queue = queue[1:]
		response = append(response, current)

		for x := 0; x < size; x++ {
			if matrix[current][x] != 0 && !visited[x] {
				visited[x] = true
				queue = append(queue, x)

			}
		}
	}

	return response
}

func main() {
	matrix := make([][]int, 5)
	for i := range matrix {
		matrix[i] = make([]int, 5)
	}

	matrix[0][1] = 1
	matrix[1][0] = 1
	matrix[0][2] = 1
	matrix[2][0] = 1
	matrix[1][2] = 1
	matrix[2][1] = 1
	matrix[1][3] = 1
	matrix[3][1] = 1
	matrix[2][4] = 1
	matrix[4][2] = 1
	matrix[3][4] = 1
	matrix[4][3] = 1

	result := bfs(matrix, 0)
	fmt.Println("BFS Traversal starting from node 0:", result)
}