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

func (list *List) addEnd(data interface{}) {
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

func (list *List) addStart(data interface{}) {
	node := &Node{data: data}

	if list.head == nil {
		list.head = node
		return
	}

	temp := list.head
	list.head = node
	node.next = temp
}

func (list *List) deleteNode(data interface{}) {
	pointer := list.head

	if pointer.data == data {
		list.head = pointer.next
		list.head.prev = nil
		return
	}

	for pointer != nil && pointer.data != data {
		pointer = pointer.next
	}

	if pointer == nil {
		fmt.Println("Node not found")
		return
	}

	if pointer.next == nil {
    	pointer.prev.next = nil
	} else {
		pointer.next.prev = pointer.prev
		pointer.prev.next = pointer.next
	}
}

func (list *List) lenght() int {
	if list.head == nil {
		return 0
	} else {
		count := 0
		pointer := list.head
		for pointer != nil {
			count += 1
			pointer = pointer.next
		}
		return count
	}
}

func main() {
	fmt.Println("Hello world");
}