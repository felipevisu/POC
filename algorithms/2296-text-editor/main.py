class Node:
    def __init__(self, value=""):
        self.value = value
        self.prev = None
        self.next = None


class TextEditor:

    def __init__(self):
        self.head = Node()
        self.tail = Node()

        self.cursor = Node("|")

        self.head.next = self.cursor
        self.cursor.prev = self.head

        self.cursor.next = self.tail
        self.tail.prev = self.cursor

    def addText(self, text: str) -> None:
        for c in text:
            node = Node(c)

            prev = self.cursor.prev

            prev.next = node
            node.prev = prev

            node.next = self.cursor
            self.cursor.prev = node

    def deleteText(self, k: int) -> int:
        deleted = 0

        while deleted < k and self.cursor.prev != self.head:
            to_delete = self.cursor.prev
            prev = to_delete.prev

            prev.next = self.cursor
            self.cursor.prev = prev

            deleted += 1

        return deleted

    def cursorLeft(self, k: int) -> str:
        while k > 0 and self.cursor.prev != self.head:
            left = self.cursor.prev

            # swap cursor with left node
            left_prev = left.prev
            right = self.cursor.next

            left_prev.next = self.cursor
            self.cursor.prev = left_prev

            self.cursor.next = left
            left.prev = self.cursor

            left.next = right
            right.prev = left

            k -= 1

        return self.getLeftText()

    def cursorRight(self, k: int) -> str:
        while k > 0 and self.cursor.next != self.tail:
            right = self.cursor.next

            right_next = right.next
            left = self.cursor.prev

            left.next = right
            right.prev = left

            right.next = self.cursor
            self.cursor.prev = right

            self.cursor.next = right_next
            right_next.prev = self.cursor

            k -= 1

        return self.getLeftText()

    def getLeftText(self):
        result = []
        node = self.cursor.prev
        count = 10

        while node != self.head and count > 0:
            result.append(node.value)
            node = node.prev
            count -= 1

        return "".join(reversed(result))
