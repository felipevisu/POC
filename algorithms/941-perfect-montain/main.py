def valid_mountain_array(arr):
    if len(arr) < 3:
        return False

    l = 0
    r = len(arr) - 1

    while l < r:
        if arr[l] < arr[l + 1]:
            l += 1
        else:
            break

    while r > l:
        if arr[r] < arr[r - 1]:
            r -= 1
        else:
            break

    return l == r and l != 0 and r != len(arr) - 1

def test():
    assert valid_mountain_array([1, 2]) == False
    assert valid_mountain_array([3, 5, 5]) == False
    assert valid_mountain_array([0,3,2,1]) == True
