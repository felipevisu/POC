def missing_number(arr):
    size = len(arr)
    new_arr = [-1 for i in range(size + 1)]
    for item in arr:
        new_arr[item] = item
    for i in range(len(new_arr)):
        if new_arr[i] == -1:
            return i


def test():
    assert missing_number([5, 3, 2, 4, 0]) == 1
