package main

import "fmt"

func dfs(node int, matrix [][]int, visited []bool, result *[]int) {
	visited[node] = true
	*result = append(*result, node)

	for neighbor := range matrix {
		if matrix[node][neighbor] == 1 && !visited[neighbor] {
			dfs(neighbor, matrix, visited, result)
		}
	}
}

func main(){
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
	matrix[2][3] = 1
	matrix[3][2] = 1
	matrix[2][4] = 1
	matrix[4][2] = 1

	visited := make([]bool, 5)
	result := []int{}

	dfs(0, matrix, visited, &result)
	fmt.Println(result)
}