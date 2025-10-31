package main

type TreeNode struct {
    Val int
    Left *TreeNode
    Right *TreeNode
}

func depth(node *TreeNode, target int, current int) bool {
	if(node == nil){
		return false
	}

    current += node.Val

	if(node.Left == nil && node.Right == nil && current == target){
		return true
	}

	left := depth(node.Left, target, current)
	right := depth(node.Right, target, current)

	return left || right
}

func hasPathSum(root *TreeNode, targetSum int) bool {
	return depth(root, targetSum, 0)
}