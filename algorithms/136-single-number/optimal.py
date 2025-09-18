from typing import List


class Solution:
    def singleNumber(self, nums: List[int]) -> int:
        total = sum(nums)
        unique_total = sum(set(nums))
        number = 2 * unique_total - total
        return number


def test():
    assert Solution().singleNumber([2, 2, 1]) == 1
    assert Solution().singleNumber([4, 1, 2, 1, 2]) == 4
    assert Solution().singleNumber([1]) == 1
