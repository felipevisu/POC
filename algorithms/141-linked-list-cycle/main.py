class ListNode:
    def __init__(self, x):
        self.val = x
        self.next = None


class Solution:
    def hasCycle(self, head: ListNode) -> bool:
        hare = head
        turtle = head

        while turtle and hare and hare.next:
            hare = hare.next.next
            turtle = turtle.next
            if turtle == hare:
                return True
        return False


def test_with_cycle():
    item1 = ListNode(1)
    item2 = ListNode(2)
    item3 = ListNode(3)
    item4 = ListNode(4)

    item1.next = item2
    item2.next = item3
    item3.next = item4
    item4.next = item1

    assert Solution().hasCycle(item1) == True


def test_without_cycle():
    item1 = ListNode(1)
    item2 = ListNode(2)
    item3 = ListNode(3)
    item4 = ListNode(4)

    item1.next = item2
    item2.next = item3
    item3.next = item4

    assert Solution().hasCycle(item1) == False
