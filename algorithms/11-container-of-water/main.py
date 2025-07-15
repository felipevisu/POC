from typing import List

def max_area_brute_force(height: List[int]) -> int:
    size  = len(height)
    result = 0

    for left in range(size):
        for right in reversed(range(size)):
            print(left, right, height[left], height[right])
            if left >= right:
                continue
            area = (right - left) * min(height[left], height[right])
            if area > result:
                result = area

    return result


def max_area_dp(height: List[int]) -> int:
    size  = len(height)
    result = 0

    left = 0
    right = size - 1

    while left < right:
        print(left, right, height[left], height[right])
        area = (right - left) * min(height[left], height[right])
        if area > result:
            result = area

        if height[left] < height[right]:
            left += 1
        else:
            right -= 1

    return result


def test_max_area_brute_force():
    assert max_area_brute_force([1,8,6,2,5,4,8,3,7]) == 49


def test_max_area_dp():
    assert max_area_dp([1,8,6,2,5,4,8,3,7]) == 49