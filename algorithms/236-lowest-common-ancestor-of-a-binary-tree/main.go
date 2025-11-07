package main

type TreeNode struct {
	Val int
	Left *TreeNode
	Right *TreeNode
}

func lowestCommonAncestor(root, p, q *TreeNode) *TreeNode {
	if(root == nil){
		return nil
	}

	if(root.Val == p.Val || root.Val == q.Val){
		return root
	}

	var left = lowestCommonAncestor(root.Left, p, q)
	var right = lowestCommonAncestor(root.Right, p, q)

	if(left == nil && right != nil){
		return right
	}

	if(left != nil && right == nil){
		return left
	}
}