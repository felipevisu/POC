"""
Gauss Formula
1 + 2 + 4 + ... + n = n*(n+1)/2
"""


def missing_number(arr):
    n = len(arr)
    intended_sum = n * (n + 1) / 2
    actual_sum = sum(arr)
    return intended_sum - actual_sum


def test():
    assert missing_number([5, 3, 2, 4, 0]) == 1
