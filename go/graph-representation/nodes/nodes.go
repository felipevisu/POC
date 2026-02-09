package main

import "fmt"

type Node struct {
	value int
	neighbors []*Node
}

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

	nodes := make([]*Node, size)
	for i := 0; i < size; i++ {
		nodes[i] = &Node{value: i}
	}

	for _, p := range points {
		nodes[p.x].neighbors = append(nodes[p.x].neighbors, nodes[p.y])
	}

	for _, n := range nodes {
		fmt.Printf("Node %d -> ", n.value)
		for _, neigh := range n.neighbors {
			fmt.Printf("%d ", neigh.value)
		}
		fmt.Println()
	}
}