from main import TextEditor


def test_add_text():
    editor = TextEditor()
    editor.addText("hello")

    assert editor.cursorLeft(0) == "hello"


def test_delete_text():
    editor = TextEditor()
    editor.addText("hello")

    deleted = editor.deleteText(2)

    assert deleted == 2
    assert editor.cursorLeft(0) == "hel"


def test_delete_more_than_exists():
    editor = TextEditor()
    editor.addText("abc")

    deleted = editor.deleteText(10)

    assert deleted == 3
    assert editor.cursorLeft(0) == ""


def test_cursor_left():
    editor = TextEditor()
    editor.addText("abcdef")

    result = editor.cursorLeft(2)

    assert result == "abcd"


def test_cursor_right():
    editor = TextEditor()

    editor.addText("abcdef")
    editor.cursorLeft(4)

    result = editor.cursorRight(2)

    assert result == "abcd"
