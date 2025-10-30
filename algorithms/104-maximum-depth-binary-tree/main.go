package main

type TreeNode struct {
    Val int
    Left *TreeNode
    Right *TreeNode
}

func depth(node *TreeNode, l int) int {
	if(node != nil){
		left := depth(node.Left, l+1)
		right := depth(node.Right, l+1)
		if(left > right){
			return left
		}
		return right
	}
	return l
}

func maxDepth(root *TreeNode) int {
	return depth(root, 0)
}