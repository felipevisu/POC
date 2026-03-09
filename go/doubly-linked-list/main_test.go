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