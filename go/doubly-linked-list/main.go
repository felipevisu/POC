package doublylinkedlist

import "fmt"

type Node struct {
	data interface{}
	next *Node
	prev *Node
}

type List struct {
	head *Node
}

func (list *List) addNode(data interface{}){
	node := &Node{data: data}

	if list.head == nil {
		list.head = node
		return
	}

	pointer := list.head
	for pointer.next != nil {
		pointer = pointer.next
	}

	node.prev = pointer
	pointer.next = node
}

func main(){
	fmt.Println("Hello world");
}