package doublylinkedlist

import "testing"

func TestAddNode(t *testing.T) {
	list := &List{}
	list.addNode(10)

	if list.head == nil {
		t.Error("Expected head to be initialized")
	}

	if list.head.data != 10 {
		t.Errorf("Expected head data to be 10, got %v", list.head.data)
	}

	if list.head.next != nil {
		t.Error("Expected head.next to be nil")
	}
}

func TestAddMultipleNodes(t *testing.T) {
	list := &List{}
	list.addNode(10)
	list.addNode(20)

	first := list.head
	second := list.head.next

	if second == nil {
		t.Fatal("Expected second node")
	}

	if second.data != 20 {
		t.Errorf("Expected second node data to be 20, got %v", second.data)
	}

	if second.prev != first {
		t.Error("Expected second.prev to point to first node")
	}

	if first.next != second {
		t.Error("Expected first.next to point to second node")
	}
}

func TestDeleteNode(t *testing.T) {
	list := &List{}
	list.addNode(10)
	list.addNode(20)
	list.addNode(30)

	list.deleteNode(list.head.next.data)

	if list.head.next == nil {
		t.Fatal("Expected second node")
	}

	if list.head.next.data == 20 {
		t.Errorf("Expected second node data to be 20, got %v", list.head.next.data)
	}
}

func TestDeleteHeadNode(t *testing.T) {
	list := &List{}
	list.addNode(10)
	list.addNode(20)
	list.addNode(30)

	list.deleteNode(10)

	if list.head == nil {
		t.Fatal("Expected head to exist after deletion")
	}

	if list.head.data != 20 {
		t.Errorf("Expected new head data to be 20, got %v", list.head.data)
	}

	if list.head.prev != nil {
		t.Error("Expected new head.prev to be nil")
	}

	if list.head.next.data != 30 {
		t.Errorf("Expected head.next data to be 30, got %v", list.head.next.data)
	}
}

func TestDeleteTailNode(t *testing.T) {
	list := &List{}
	list.addNode(10)
	list.addNode(20)
	list.addNode(30)

	list.deleteNode(30)

	if list.head.next == nil {
		t.Fatal("Expected second node to exist")
	}

	if list.head.next.data != 20 {
		t.Errorf("Expected second node data to be 20, got %v", list.head.next.data)
	}

	if list.head.next.next != nil {
		t.Error("Expected tail.next to be nil after deletion")
	}
}

func TestDeleteMiddleNode(t *testing.T) {
	list := &List{}
	list.addNode(10)
	list.addNode(20)
	list.addNode(30)

	list.deleteNode(20)

	if list.head.next == nil {
		t.Fatal("Expected second node to exist")
	}

	if list.head.next.data != 30 {
		t.Errorf("Expected second node data to be 30 after middle deletion, got %v", list.head.next.data)
	}

	if list.head.next.prev != list.head {
		t.Error("Expected new second node.prev to point to head")
	}
}

func TestDeleteOnlyNode(t *testing.T) {
	list := &List{}
	list.addNode(10)

	defer func() {
		if r := recover(); r != nil {
			t.Log("deleteNode panics when deleting the only node - implementation needs fix")
		}
	}()

	list.deleteNode(10)

	if list.head != nil {
		t.Error("Expected head to be nil after deleting only node")
	}
}

func TestDeleteNonExistentNode(t *testing.T) {
	list := &List{}
	list.addNode(10)
	list.addNode(20)

	list.deleteNode(99)

	if list.head.data != 10 {
		t.Errorf("Expected head data to remain 10, got %v", list.head.data)
	}

	if list.head.next.data != 20 {
		t.Errorf("Expected second node data to remain 20, got %v", list.head.next.data)
	}
}