# The isBadVersion API is already defined for you.
# def isBadVersion(version: int) -> bool:


class Solution:
    def firstBadVersion(self, n: int) -> int:
        l = 0
        r = n + 1

        while l <= r:
            mid = (r + l) // 2
            if isBadVersion(mid):
                if mid == 1 or (mid - 1 > 0 and not isBadVersion(mid - 1)):
                    return mid
                else:
                    r = mid
            else:
                l = mid + 1

        return l
