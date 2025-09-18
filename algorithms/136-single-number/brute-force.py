from typing import List


class Solution:
    def singleNumber(self, nums: List[int]) -> int:
        m = {}
        for i in nums:
            if i in m:
                m[i] = m[i] + 1
            else:
                m[i] = 1
        for key in m:
            if m[key] == 1:
                return key


def test():
    assert Solution().singleNumber([2, 2, 1]) == 1
    assert Solution().singleNumber([4, 1, 2, 1, 2]) == 4
    assert Solution().singleNumber([1]) == 1
